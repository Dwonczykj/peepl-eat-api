/* eslint-disable no-console */
// * secrets_relative_paths=config/local.js,config/aws.json,config/we-are-vegi-app-firebase-adminsdk-69yvy-26ba373cd9.json,config/stripe.json,config/test_stripe.json NODE_ENV=production-script node ./node_modules/sails/bin/sails run secrets-to-env
// const _ = require(`lodash`);
const fs = require(`fs`);
const path = require('path');

console.log(`Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]`);

// console.log(v8.getHeapStatistics().heap_size_limit / (1024 * 1024));

function sleep(milliseconds, timeUnitMultiplier=1) {
  const date = Date.now();
  let currentDate = null;
  if (!(timeUnitMultiplier > 0)) {
    console.warn(`Can only use time periods > 1`);
    timeUnitMultiplier = 1;
  }
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds * timeUnitMultiplier);
}

const kebabize = (str, forceJoinerStr = '-') =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? (forceJoinerStr || '-') : '') + $.toLowerCase()
  );

// const words = [
//   'StackOverflow',
//   'camelCase',
//   'alllowercase',
//   'ALLCAPITALLETTERS',
//   'CustomXMLParser',
//   'APIFinder',
//   'JSONResponseData',
//   'Person20Address',
//   'UserAPI20Endpoint',
// ];

// console.log(words.map((w) => kebabize(w,'-')));

function isValueType(o) {
  return ['string','boolean','number'].indexOf(typeof(o))>-1;
}

function isValidJson(o) {
  try {
    JSON.parse(o);
    return true;
  } catch (error) {
    return false;
  }
}

if(process.env.NODE_ENV !== 'production'){
  console.warn(`The NODE_ENV of \`${process.env.NODE_ENV}\` will be referenced in secret javascript modules such as local.js to predicate which whether to use production or development config variables. Are you sure you are running with the correct build environment? This will not encode production configuration.`);
  sleep(5,1000);
}

require('ts-node/register');

function convertToEnvJsonSimple(object) {
  let envFile = '';
  for (const key of Object.keys(object)) {
    let keyName = key;
    let value = object[key];
    if (!isValueType(value)) {
      keyName = `${key}_json`;
      value = JSON.stringify(value);
      envFile += `${keyName}=${value}\n`;
    } else {
      if (typeof object[key] === 'string') {
        value = `"${object[key]}"`; //Ensures strings with spaces in them arent a problem
      }
      envFile += `${keyName}=${value}\n`;
    }
  }
  return envFile;
}

function convertToEnv(object) {
  if (isValueType(object)) {
    return object;
  }
  let envFile = '';
  function keyValueTupleArrays(obj, prop, recursionCounter=10){
    if(!recursionCounter || recursionCounter>10){
      console.warn(
        `Hit the recursion limit of ${recursionCounter} stacked function calls to keyValueTupleArrays()`
      );
    }
    // return [prop,obj[prop]] if obj[prop] is value type else [prop.subprop,]
    if(!Object.keys(obj).includes(prop)){
      throw Error(`keyValueTupleArrays -> object does not include key: "${prop}"`);
    }
    if(isValueType(obj[prop])){
      return [
        [prop, typeof object[obj[prop]] === 'string' ? isValidJson(obj[prop]) ? obj[prop] : `"${obj[prop]}"` : obj[prop]],
      ]; // [(key,value)]
    } else {
      const result = Object.keys(obj[prop]).map((subprop) =>
        keyValueTupleArrays(obj[prop], subprop, recursionCounter + 1)
      ); // [ (key,value) ]
      const out = result.map((res) => [`${prop}.${res[0]}`, res[1]]);
      return out;
    }
  }
  if (process.env.deep_keys === true) {
    // Flatten all embedded objects with deep key names containing "."s
    for (const key of Object.keys(object)) {
      const kvps = keyValueTupleArrays(object,key,1);
      for (const resKVP of kvps){
        envFile += `${resKVP[0]}=${resKVP[1]}\n`;
      }
    }
  }
  for (const key of Object.keys(object)) {
    let keyName = key;
    let value = object[key];
    if(!isValueType(value)){
      keyName = `${key}_json`;
      value = JSON.stringify(value);
      envFile += `${keyName}=${value}\n`;
    } else {
      if (typeof(object[key]) === 'string'){
        if(isValidJson(object[key])){
          value = object[key];
        }else{
          value = `"${object[key]}"`; //Ensures strings with spaces in them arent a problem
        }
      }
      envFile += `${keyName}=${value}\n`;
    }
  }
  return envFile;
}


function convertToEnvBase64(object, envKeyName) {
  let value = '';
  RegExp.prototype.toJSON = function () {
    return this.source;
  };
  if(isValueType(object)){
    value = object;
  } else if (object instanceof RegExp) {
    value = JSON.stringify(object);
  } else {
    value = Buffer.from(JSON.stringify(object)).toString('base64');
  }
  const returnKey = kebabize(envKeyName.replace(/\.[^/.]+$/, ""),'_').replace(/-/g,'_');
  return `${returnKey}=${value}\n`;
  // for (const key of Object.keys(object)) {
  //   let keyName = key;
  //   let value = object[key];
  //   if(!isValueType(value)){
  //     keyName = `${key}_json`;
  //     // ~ https://stackoverflow.com/a/61844642
  //     value = Buffer.from(
  //       JSON.stringify(value)
  //     ).toString('base64');
  //     envFile += `${keyName}=${value}\n`;
  //   } else {
  //     if (typeof(object[key]) === 'string'){
  //       if (isValidJson(object[key])) {
  //         value = Buffer.from(object[key]).toString('base64');
  //       } else if (!object[key].startsWith('"') && object[key].includes(" ")) {
  //         value = `"${object[key]}"`; //Ensures strings with spaces in them arent a problem
  //       }
  //     }
  //     envFile += `${keyName}=${value}\n`;
  //   }
  // }
  // return envFile;
}

function readSecretsFromEnv() {
  for (const key of Object.keys(process.env)) {
    if(process.env.deep_keys === true){
      // allow keys to contain "."s and split on the the .
    }
  }
}

module.exports = {


  friendlyName: 'Secrets to env',


  description: 'Convert all secrets JSON files to env key value pairs',


  fn: async function () {


    sails.log.info(
      `Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]: ... (\n\t\`secrets_relative_paths=secretPath1,secretPath2 NODE_ENV=development sails run secrets-to-env\`\n)`
    );

    const _dir = path.resolve(
      sails.config.appPath,
      `config`
    );

    if(!fs.existsSync(_dir)){
      throw Error(`Directory: "${_dir}" does not exist!`);
    }

    if(!process.env.secrets_relative_paths){
      throw Error(
        `Environment variable \`secrets_relative_paths\` is undefined. Please run command secrets_relative_paths="secretPath1,secretPath2" NODE_ENV="production" sails run secrets-to-env`
      );
    }

    /**
     * The function `isValidOverride` checks if a given `overrideNodeEnv` value is valid by comparing
     * it to a list of allowed values.
     * @param overrideNodeEnv - The `overrideNodeEnv` parameter is a string that represents the
     * environment override value.
     * @returns The function `isValidOverride` returns a boolean value indicating whether the
     * `overrideNodeEnv` parameter is a valid override value.
     */
    const isValidOverride = (overrideNodeEnv) => {
      return [
        "development",
        "production",
        "production-script",
        "QA",
        "test",
      ].includes(overrideNodeEnv);
    }
    
    
    /**
     * The function `loadOutputFromLocal` loads output from local files and returns an object
     * containing the output and a simplified environment variable string.
     * @param overrideNodeEnv - The `overrideNodeEnv` parameter is a boolean value that determines
     * whether to override the `NODE_ENV` environment variable. If set to `true`, the `NODE_ENV`
     * environment variable will be set to the value provided as the `overrideNodeEnv` argument.
     * @returns The function `loadOutputFromLocal` returns an object with two properties: `output` and
     * `outputSimpleEnv`.
     */
    const loadOutputFromLocal = async (overrideNodeEnv) => {
      const presetNodeEnv = process.env.NODE_ENV;
      if(overrideNodeEnv && isValidOverride(overrideNodeEnv)){
        sails.log.verbose(`Overriding NODE_ENV to "${overrideNodeEnv}"`);
        process.env.NODE_ENV = overrideNodeEnv;
      }
      const secretPaths = process.env.secrets_relative_paths
        .split(',')
        .map((sp) =>
          path.resolve(sails.config.appPath, sp)
        );
      const output = {};
      let outputSimpleEnv = '';
      const currentdate = new Date();
      outputSimpleEnv += `date_run="${currentdate.toLocaleString()}"\n`;
      outputSimpleEnv += `NODE_ENV="${process.env.NODE_ENV}"\n`;
      for (const sp of secretPaths){
        let bSp = sp;
        try {
          bSp = path.basename(sp);
        } catch (error) {
          sails.warn(`Unable to get basefilename from "${sp}" with error: ${error}`);
        }
        if(sp.endsWith('.json')){
          const jsonObj = await sails.helpers.fs.readJson(sp);
          if (sp.endsWith('aws.json')) {
            for(const awsKey of Object.keys(jsonObj)){
              outputSimpleEnv += `AWS_${kebabize(awsKey,'_').toUpperCase()}=${jsonObj[awsKey]}\n`;
            }
            output[bSp] = convertToEnv(jsonObj);
          } else {
            outputSimpleEnv += convertToEnvBase64(jsonObj, bSp);
            output[bSp] = convertToEnv(jsonObj);
          }
        } else if (sp.endsWith('.js')){
          try {
            console.log(`Requiring "${sp}" in "${process.env.NODE_ENV}"`);
            delete require.cache[require.resolve(sp)];
            const mod = require(sp);
            if(sp.endsWith('local.js')){
              const jsonObj = {
                config: mod,
              };
              outputSimpleEnv += convertToEnvBase64(jsonObj, bSp);
              output['sails'] = JSON.stringify(jsonObj, null, 4);
            }else{
              outputSimpleEnv += convertToEnvBase64(mod, bSp);
              output[bSp] = convertToEnv(mod);
            }
          } catch (error) {
            sails.log.verbose(`resetting NODE_ENV to "${presetNodeEnv}"`);
            process.env.NODE_ENV = presetNodeEnv;
            throw Error(
              `Error trying to require the js file at "${bSp}.\nCheck that this file is a commonjs module with module.exports in the file.\nError:${error}"`
            );
          }

        } else {
          sails.log.verbose(`resetting NODE_ENV to "${presetNodeEnv}"`);
          process.env.NODE_ENV = presetNodeEnv;
          throw Error(
            `Not sure how to process files with extension like this: "${bSp}"`
          );
        }
      }
      sails.log.verbose(`resetting NODE_ENV to "${presetNodeEnv}"`);
      process.env.NODE_ENV = presetNodeEnv;
      return {
        'output': output,
        'outputSimpleEnv': outputSimpleEnv,
      };
    };

    const {output, outputSimpleEnv} = await loadOutputFromLocal();
    
    try {
      const savePathJson = path.resolve(sails.config.appPath, 'out_env.json');
  
      await sails.helpers.fs.writeJson.with({
        destination: savePathJson,
        json: output,
        force: true,
      });
    } catch (error) {
      sails.log.warn(`Unable to output to out_env.json with error: ${error}`);
    }

    const saveToEnvFileEncoded = (envFilePath, output) => {
      let savePathEnv = path.resolve(sails.config.appPath, envFilePath);
      
      sails.log.info(`Writing entire env output to "${savePathEnv}"`);
      sails.log.info(`First 300 chars are: \n` + outputSimpleEnv.slice(0,300));
      fs.writeFileSync(
        savePathEnv,
        output,
        { encoding: 'utf8', flag: 'w' }
        // (err) => {
        //   if (err) {
        //     sails.log.error(
        //       `Threw writing .env file to "${savePathEnv}".\nError: ${err}`
        //     );
        //   } else {
        //     sails.log.info(`Env vars written to "${savePathEnv}"`);
        //   }
        // }
      );
      sails.log.info(`Env vars written to "${savePathEnv}"`);
    };

    saveToEnvFileEncoded(`.env`, outputSimpleEnv);
    

    // let savePathEnv = path.resolve(sails.config.appPath, `.env`);
    
    // sails.log.info(`Writing entire env output to "${savePathEnv}"`);
    // sails.log.info(`First 300 chars are: \n` + outputSimpleEnv.slice(0,300));
    // fs.writeFileSync(
    //   savePathEnv,
    //   outputSimpleEnv,
    //   { encoding: 'utf8', flag: 'w' }
    //   // (err) => {
    //   //   if (err) {
    //   //     sails.log.error(
    //   //       `Threw writing .env file to "${savePathEnv}".\nError: ${err}`
    //   //     );
    //   //   } else {
    //   //     sails.log.info(`Env vars written to "${savePathEnv}"`);
    //   //   }
    //   // }
    // );
    // sails.log.info(`Env vars written to "${savePathEnv}"`);


    for (const bSp of Object.keys(output)){
      let savePathEnvSp = path.resolve(sails.config.appPath, `${bSp}.env`);
      if(bSp === 'sails'){
        savePathEnvSp = path.resolve(sails.config.appPath, `${bSp}.env`);
      }

      saveToEnvFileEncoded(savePathEnvSp, output[bSp]);
      // sails.log.info(`Writing output to "${savePathEnvSp}"`);
      // fs.writeFileSync(
      //   savePathEnvSp,
      //   output[bSp],
      //   { encoding: 'utf8', flag: 'w' },
      //   // (err) => {
      //   //   if (err) {
      //   //     sails.log.error(
      //   //       `Threw writing .env file to "${savePathEnv}".\nError: ${err}`
      //   //     );
      //   //   } else {
      //   //     sails.log.info(`Env vars written to "${savePathEnv}"`);
      //   //   }
      //   // }
      // );
      // sails.log.info(`Env vars written to "${savePathEnvSp}"`);
    }

    const { output: unusedOutputQA, outputSimpleEnv: outputSimpleEnvQA } =
      await loadOutputFromLocal('development');
    saveToEnvFileEncoded(`.env_qa`, outputSimpleEnvQA);


    sails.log.info(`All env vars written!`);

  }

};

