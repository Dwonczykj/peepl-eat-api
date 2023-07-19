/* eslint-disable no-console */
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import { PassThrough, Readable } from 'stream';
import sharp from 'sharp';

import {
  sailsVegi,
} from '../interfaces/iSails';
import {
  SailsActionDefnType,
} from '../../scripts/utils';

declare var sails: sailsVegi;


export type UploadOneS3Inputs = {
  image: Readable | string,
};

export type UploadOneS3Response = {
  fd: string | null,
  ffd: string | null,
} | {
  error: any;
  message?: string;
} | undefined;

export type UploadOneS3Exits = {
  success: (unusedData: UploadOneS3Response) => any;
};

type _FilePassThrough = PassThrough & {
  filename: string;
  headers: { [k: string]: string };
};

async function streamToBuffer(stream: PassThrough): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    stream.on('error', (error: Error) => {
      sails.log.error(`streamToBuffer() failed to convert the file to a buffer with error: ${error}`);
      reject(error);
    });
  });
}

// async function resizeAndCompressImage(
//   buffer: Buffer,
//   targetSize: number
// ): Promise<Buffer> {
//   const sharpInstance = sharp(buffer);

//   // Get the image metadata
//   const metadata = await sharpInstance.metadata();

//   // Calculate the target width and height
//   let targetWidth = metadata.width;
//   let targetHeight = metadata.height;

//   if (metadata.size && metadata.size > targetSize) {
//     const scaleFactor = Math.sqrt(metadata.size / targetSize);
//     targetWidth = Math.round(metadata.width / scaleFactor);
//     targetHeight = Math.round(metadata.height / scaleFactor);
//   }

//   // Resize and compress the image
//   const resizedBuffer = await sharpInstance
//     .resize(targetWidth, targetHeight)
//     .toBuffer({ resolveWithObject: false, quality: 80 });

//   return resizedBuffer;
// }
async function compressImage(
  buffer: Buffer,
  maxQualityLoss: number
): Promise<Buffer> {
  let quality = 100;
  let compressedBuffer = buffer;

  while (quality > 1) {
    const currentQuality = Math.max(quality - 5, 1);
    const { size } = await sharp(buffer)
      .jpeg({ quality: currentQuality })
      .toBuffer({ resolveWithObject: true });

    const qualityLoss = 1 - size / buffer.length;
    if (qualityLoss <= maxQualityLoss) {
      compressedBuffer = await sharp(buffer)
        .jpeg({ quality: currentQuality })
        .toBuffer();
      break;
    }

    quality -= 5;
  }

  return compressedBuffer;
}

async function resizeImage(
  buffer: Buffer,
  targetSize: number
): Promise<Buffer> {
  let width = Math.round(Math.sqrt(targetSize));
  let height = Math.round(targetSize / width);

  const { size } = await sharp(buffer)
    .resize(width, height)
    .toBuffer({ resolveWithObject: true });

  while (size > targetSize && width > 1 && height > 1) {
    width -= 10;
    height = Math.round(targetSize / width);

    const { size: newSize } = await sharp(buffer)
      .resize(width, height)
      .toBuffer({ resolveWithObject: true });
    if (newSize <= targetSize) {
      break;
    }
  }

  const resizedBuffer = await sharp(buffer).resize(width, height).toBuffer();
  return resizedBuffer;
}

// function convertPassThroughToBuffer(
//   passThrough: PassThrough
// ): Promise<ArrayBuffer> {
//   return new Promise<ArrayBuffer>((resolve, reject) => {
//     const chunks: Buffer[] = [];

//     passThrough.on('data', (chunk) => {
//       chunks.push(chunk);
//     });

//     passThrough.on('end', () => {
//       const buffer = Buffer.concat(chunks);
//       const arrayBuffer = buffer.buffer.slice(
//         buffer.byteOffset,
//         buffer.byteOffset + buffer.byteLength
//       );
//       resolve(arrayBuffer);
//     });

//     passThrough.on('error', (error) => {
//       reject(error);
//     });
//   });
// }

async function convertFileToReadableStream(file: _FilePassThrough) {
  sails.log.verbose(`Convert file to stream`);
  const filename = file.filename;
  const headers = file.headers;
  // Convert the PassThrough stream to a Buffer
  const buffer = await streamToBuffer(file);
  // const arrayBuffer = await convertPassThroughToBuffer(file);
  return { filename, headers, buffer };

  // // Convert the PassThrough stream to a Promise
  // const stream = file;
  // const streamPromise = streamToPromise(stream);

  // // Wait for the stream to be completely read and converted to a Buffer
  // const buffer = await streamPromise;

  // // Convert the Buffer to a ReadableStream
  // const readableStream = new ReadableStream({
  //   start(controller) {
  //     const bufferStream = new ReadableStream({
  //       start(controller) {
  //         controller.enqueue(buffer);
  //         controller.close();
  //       }
  //     });

  //     const reader = bufferStream.getReader();

  //     function read() {
  //       return reader.read().then(({ done, value }) => {
  //         if (done) {
  //           controller.close();
  //           return;
  //         }

  //         controller.enqueue(value);
  //         return read();
  //       });
  //     }

  //     return read();
  //   }
  // });

  // return { filename, headers, readableStream };
}

// function convertReadableStreamToArrayBuffer(readableStream: Readable) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];

//     readableStream.on('data', (chunk) => {
//       chunks.push(chunk);
//     });

//     readableStream.on('end', () => {
//       const buffer = Buffer.concat(chunks);
//       const arrayBuffer = buffer.buffer.slice(
//         buffer.byteOffset,
//         buffer.byteOffset + buffer.byteLength
//       );
//       resolve(arrayBuffer);
//     });

//     readableStream.on('error', (error) => {
//       reject(error);
//     });
//   });
// }

async function uploadImageToS3(imageFile) {
  // Configure the S3 client
  const region = sails.config.custom.amazonS3BucketRegion || 'eu-west-2';
  const s3Client = new S3Client({
    region: region,
    credentials: {
      accessKeyId: sails.config.custom.amazonS3AccessKey,
      secretAccessKey: sails.config.custom.amazonS3Secret,
    },
    // bucket: sails.config.custom.amazonS3Bucket,
    // maxBytes: sails.config.custom.amazonS3MaxUploadSizeBytes,
    // ACL: 'public-read', // Optional: Set the desired ACL for the file
    // ContentType: 'image/jpeg', // Set the correct content type of the file
    // CacheControl: 'no-cache', // Set cache control header to prevent caching
    // bodyLengthChecker: (body) => {
    //   if(body){

    //   }
    // }
  });

  // Read the image file as a Buffer
  // var fileContent:
  //   | string
  //   | ArrayBuffer; // await readFileAsync(imageFile);

  const selectedFile = imageFile._files[0];
  if (!Object.keys(selectedFile).includes('stream')) {
    sails.log.verbose(
      `Unable to parse selectedFile from input to upload-one-s3 helper:`
    );
    sails.log.verbose(selectedFile);
    return;
  }
  const selectedFileStream: _FilePassThrough = selectedFile.stream;
  let { filename, headers, buffer } = await convertFileToReadableStream(
    selectedFileStream
  );
  
  // Check if the image size exceeds 500KB
  if (buffer.length > sails.config.custom.amazonS3MaxUploadSizeBytes || (500 * 1024)) {
    sails.log.verbose(
      `Compressing image from ${(buffer.length / (1024 * 1024)).toFixed(
        2
      )} MB to less than ${
        (sails.config.custom.amazonS3MaxUploadSizeBytes / 1024) || 500
      } KB`
    );
    // Compress the image with a maximum quality loss of 50%
    const compressedBuffer = await compressImage(buffer, 0.5);

    // Resize the image to reduce the size further if needed
    const resizedBuffer = await resizeImage(
      compressedBuffer,
      sails.config.custom.amazonS3MaxUploadSizeBytes || 500 * 1024
    );

    // const resizedBuffer = await resizeAndCompressImage(
    //   buffer,
    //   sails.config.custom.amazonS3MaxUploadSizeBytes / 1024 || 500
    // );
    
    // Compress the image using Sharp
    // const _compressedBuffer = await sharp(buffer)
    //   .resize({ fit: 'inside', withoutEnlargement: true })
    //   .toBuffer();
    // Use the compressedBuffer for uploading
    if (buffer.length > 1024 * 1024) {
      sails.log.verbose(
        `Compressed image from ${(buffer.length / (1024 * 1024)).toFixed(
          2
        )} MB to ${(resizedBuffer.length / 1024).toFixed(2)} KB`
      );
    } else {
      sails.log.verbose(
        `Compressed image from ${(buffer.length / 1024).toFixed(2)} KB to ${(
          resizedBuffer.length / 1024
        ).toFixed(2)} KB`
      );
    }
    // Use the resizedBuffer for uploading
    buffer = resizedBuffer;
    // buffer = _compressedBuffer;
  }
  // const arrayBuffer: any = await convertReadableStreamToArrayBuffer(readableStream);
  // .then(({ filename, headers, readableStream }) => {
  //   console.log('Filename:', filename);
  //   console.log('Headers:', headers);

  //   // Use the readableStream as needed
  //   // e.g., pass it to an S3 upload function

  // })
  // .catch((error) => {
  //   console.error('Error:', error);
  // });

  const key = filename;
  // sails.log.verbose(`Selected file:`);
  // sails.log.verbose(selectedFile);
  // sails.log.verbose(filename);
  // sails.log.verbose(headers);

  // ~ https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/PutObjectCommand/

  // Upload the image file to S3
  const command = new PutObjectCommand({
    Bucket: sails.config.custom.amazonS3Bucket,
    Key: key,
    CacheControl: 'no-cache',
    Body: buffer,
    
  });
  try {
    const response = await s3Client.send(command);
    const encodedKey = encodeURIComponent(key);
    var imageUri = `https://${sails.config.custom.amazonS3Bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
    sails.log.verbose(
      `Image uploaded successfully. ETag: ${response.ETag}. Uri: ${imageUri}`
    );
    // const getCommand = new GetObjectCommand({
    //   Bucket: sails.config.custom.amazonS3Bucket,
    //   Key: key,
    // });
    // try{
    //   const imageUriGetResponse = await s3Client.send(getCommand);
    //   sails.log.verbose(imageUriGetResponse);
    //   imageUri = imageUriGetResponse.Location;
    // } catch (err) {
    //   sails.log.error(`Error fetching new upload from s3 bucket: ${err}`);
    // }

    // eslint-disable-next-line no-console
    // sails.log.verbose(response);
    // sails.log.verbose(response.$metadata);
    const imageUrl = imageUri; // Extract the URL from the response
    sails.log.verbose(imageUrl);
    const s3UploadSucceeded = true;
    const s3UploadInfo = imageUri;
    return { s3UploadSucceeded, s3UploadInfo, key };
  } catch (error) {
    sails.log.error('Error uploading image:', error);
    const s3UploadSucceeded = false;
    const s3UploadInfo = null;
    return { s3UploadSucceeded, s3UploadInfo, key };
  }
}

// // Helper function to read file asynchronously
// function readFileAsync(filePath): Promise<any> {
//   return new Promise((resolve, reject) => {
//     fs.readFile(filePath, (error, data) => {
//       if (error) {
//         reject(error);
//         return null;
//       }
//       resolve(data);
//       return data;
//     });
//   });
// }

const _exports: SailsActionDefnType<
  UploadOneS3Inputs,
  UploadOneS3Response,
  UploadOneS3Exits
> = {
  friendlyName: 'Upload One S3',

  description: 'Upload One Image to S3',

  inputs: {
    image: {
      type: 'ref',
    },
  },

  files: ['image'],

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {
    var inTestEnv =
      sails.config.environment === 'test' ||
      sails.config.custom.FIREBASE_AUTH_EMULATOR_HOST;

    let imageInfo;
    if (!inTestEnv) {
      if (!inputs.image) {
        return exits.success({
          error: Error('No image passed to upload-one-s3'),
          message: 'No image passed to upload-one-s3',
        });
      } else if (typeof inputs.image === 'string') {
        const _imageInputString = inputs.image as string;
        const verifiedImageDomain = sails.config.custom.storageDomainsRegExps
          .map((domain) => {
            var subDomain = /(.*)/;
            var flags = '';
            if (!(domain instanceof RegExp) && typeof domain === 'string') {
              domain = RegExp(domain);
            }
            var urlPattern = new RegExp(
              domain.source + subDomain.source,
              flags
            );

            // regex3 is now /foobar/gy
            try {
              flags =
                domain.flags !== subDomain.flags
                  ? (domain.flags + subDomain.flags)
                      .split('')
                      .sort()
                      .join('')
                      .replace(/(.)(?=.*\1)/g, '')
                  : domain.flags;
            } catch (error) {
              sails.log.warn(`Unable to create regex flags of: "${flags}"`);
            }
            try {
              urlPattern = new RegExp(domain.source + subDomain.source, flags);
            } catch (error) {
              sails.log.warn(`Unable to use regex flags of: "${flags}"`);
            }
            const matches = _imageInputString.match(urlPattern);
            if (matches && matches.length >= 2) {
              return matches[1];
            } else {
              return null;
            }
          })
          .filter((match) => {
            return match !== null;
          });
        if (verifiedImageDomain.length) {
          imageInfo = {
            fd: verifiedImageDomain[0],
            ffd: _imageInputString,
          };
          return exits.success(imageInfo);
        }
      }

      // * We have an image UpStream file to upload.
      // TODO: Check if s3 container already contains an image with that key, if so, check the image bytes to see if match the UpStream, if so return that url.
      try {
        // ~ https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
        const _n = sails.config.custom.amazonS3AccessKey.length;
        const _m = Math.max(0, _n - 4);
        const obfusacatedKey =
          `*`.repeat(_m) +
          `${sails.config.custom.amazonS3AccessKey}`.substring(_m);
        sails.log.verbose(
          `Uploading an image to s3 bucket: "${sails.config.custom.amazonS3Bucket}" with access key: ${obfusacatedKey}`
        );
        
        try{
          sails.log.verbose(`Upload image to s3 sdk v3...`);
          // sails.log.verbose(inputs.image);
          const {s3UploadSucceeded, s3UploadInfo, key} = await uploadImageToS3(inputs.image);
          if(s3UploadSucceeded){
            imageInfo = {
              fd: key,
              ffd: s3UploadInfo,
            };
            const imageInfoStr = JSON.stringify(imageInfo);
            sails.log.verbose(`Image uploaded to bucket:\n${imageInfoStr}`);
            return exits.success(imageInfo);
          } else {
            return exits.success({
              error: Error(
                'Was unable to upload to s3 using v3 sdk as never finished processing the image UpStream to upload it.'
              ),
              message:
                'Was unable to upload to s3 using v3 sdk as never finished processing the image UpStream to upload it.',
            });
          }
        } catch (err) {
          sails.log.error(`Was unable to upload to s3 using v3 sdk: ${err}`);
          sails.log.error(err);
          return exits.success({
            error: err,
            message: `Was unable to upload to s3 using v3 sdk: ${err}`,
          });
        }
      //   const _img = inputs.image as any;
      //   await sails.uploadOne(
      //     _img, // : Buffer, Typed Array, Blob, String, ReadableStream
      //     {
      //       adapter: require('skipper-s3'),
      //       key: sails.config.custom.amazonS3AccessKey,
      //       secret: sails.config.custom.amazonS3Secret,
      //       bucket: sails.config.custom.amazonS3Bucket,
      //       maxBytes: sails.config.custom.amazonS3MaxUploadSizeBytes,
      //       // ACL: 'public-read', // Optional: Set the desired ACL for the file
      //       // ContentType: 'image/jpeg', // Set the correct content type of the file
      //       CacheControl: 'no-cache', // Set cache control header to prevent caching
      //     },
      //     (err, filesUploaded) => {
      //       if (err) {
      //         sails.log.error(err);
      //         sails.log.verbose(`Image upload to bucket failed ${err}`);
      //         return exits.success({
      //           error: err,
      //           message: `Image upload to bucket failed ${err}`,
      //         });
      //       }
      //       // return res.ok({
      //       //   files: filesUploaded,
      //       //   textParams: req.allParams()
      //       // });
      //       imageInfo = filesUploaded;
      //       const imageInfoFileName = imageInfo && imageInfo.filename;
      //       if (!imageInfoFileName) {
      //         sails.log.error(
      //           `Error uploading image to s3-bucket: and no files uploaded!`
      //         );
      //       }
      //       imageInfo =
      //         imageInfo && imageInfo.fd
      //           ? {
      //               ...imageInfo,
      //               ffd: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
      //             }
      //           : null;
      //       if (!imageInfo) {
      //         return exits.success({
      //           error: Error('no response from s3 upload v3 client'),
      //         });
      //       }
      //       const imageInfoStr = JSON.stringify(imageInfo);
      //       sails.log.verbose(`Image uploaded to bucket:\n${imageInfoStr}`);
      //       return exits.success(imageInfo);
      //     }
      //   );

      //   // .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
      //   // .intercept(
      //   //   (err) => new Error('The photo upload failed! ' + err.message)
      //   // );
      } catch (error) {
        sails.log.error(`Error uploading image to s3-bucket: ${error}`);
        return exits.success({
          error: error,
          message: `Error uploading image to s3-bucket: ${error}`,
        });
      }
    } else {
      imageInfo = {
        fd: inTestEnv ? 'test-image-fd-' + uuidv4() : null,
        ffd: null,
      };
      return exits.success(imageInfo);
    }
  },
};

module.exports = _exports;
