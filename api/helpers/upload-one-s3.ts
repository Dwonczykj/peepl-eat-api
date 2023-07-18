/* eslint-disable no-console */
import {v4 as uuidv4} from 'uuid'; // const { v4: uuidv4 } = require('uuid');
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import { PassThrough, Readable } from 'stream';

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
};

export type UploadOneS3Exits = {
  success: (unusedData: UploadOneS3Response) => any;
};

type _FilePassThrough = PassThrough & {
  filename: string;
  headers: { [k: string]: string };
};

async function convertFileToReadableStream(file: _FilePassThrough) {
  sails.log.verbose(`Convert file to stream`);
  const filename = file.filename;
  const headers = file.headers;
  const arrayBuffer = await convertPassThroughToBuffer(file);
  return { filename, headers, arrayBuffer };

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

function convertPassThroughToBuffer(
  passThrough: PassThrough
): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    passThrough.on('data', (chunk) => {
      chunks.push(chunk);
    });

    passThrough.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      resolve(arrayBuffer);
    });

    passThrough.on('error', (error) => {
      reject(error);
    });
  });
}

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
  const { filename, headers, arrayBuffer } = await convertFileToReadableStream(
    selectedFileStream
  );
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
    Body: arrayBuffer as any,
  });
  try {
    const response = await s3Client.send(command);
    const encodedKey = encodeURIComponent(key);
    var imageUri = `https://${sails.config.custom.amazonS3Bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
    sails.log.verbose(`Image uploaded successfully. ETag: ${response.ETag}. Uri: ${imageUri}`);
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

// Helper function to read file asynchronously
function readFileAsync(filePath): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, data) => {
      if (error) {
        reject(error);
        return null;
      }
      resolve(data);
      return data;
    });
  });
}

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
        return exits.success(undefined);
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
        
        var s3UploadInfo = {};
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
          }
        } catch (err) {
          sails.log.error(`Was unable to upload to s3 using v3 sdk: ${err}`);
          sails.log.error(err);
        }
        const _img = inputs.image as any;
        await sails.uploadOne(
          _img, // : Buffer, Typed Array, Blob, String, ReadableStream
          {
            adapter: require('skipper-s3'),
            key: sails.config.custom.amazonS3AccessKey,
            secret: sails.config.custom.amazonS3Secret,
            bucket: sails.config.custom.amazonS3Bucket,
            maxBytes: sails.config.custom.amazonS3MaxUploadSizeBytes,
            // ACL: 'public-read', // Optional: Set the desired ACL for the file
            // ContentType: 'image/jpeg', // Set the correct content type of the file
            CacheControl: 'no-cache', // Set cache control header to prevent caching
          },
          (err, filesUploaded) => {
            if (err) {
              sails.log.error(err);
              sails.log.verbose(`Image upload to bucket failed ${err}`);
              return exits.success(undefined);
            }
            // return res.ok({
            //   files: filesUploaded,
            //   textParams: req.allParams()
            // });
            imageInfo = filesUploaded;
            const imageInfoFileName = imageInfo && imageInfo.filename;
            if (!imageInfoFileName) {
              sails.log.error(
                `Error uploading image to s3-bucket: and no files uploaded!`
              );
            }
            imageInfo =
              imageInfo && imageInfo.fd
                ? {
                    ...imageInfo,
                    ffd: sails.config.custom.amazonS3BucketUrl + imageInfo.fd,
                  }
                : null;
            if (!imageInfo) {
              return exits.success({
                error: Error('no response from s3 upload v3 client'),
              });
            }
            const imageInfoStr = JSON.stringify(imageInfo);
            sails.log.verbose(`Image uploaded to bucket:\n${imageInfoStr}`);
            return exits.success(imageInfo);
          }
        );

        // .intercept('E_EXCEEDS_UPLOAD_LIMIT', 'tooBig')
        // .intercept(
        //   (err) => new Error('The photo upload failed! ' + err.message)
        // );
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
