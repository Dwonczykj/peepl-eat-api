/* eslint-disable no-console */
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

const words = [
  'StackOverflow',
  'camelCase',
  'alllowercase',
  'ALLCAPITALLETTERS',
  'CustomXMLParser',
  'APIFinder',
  'JSONResponseData',
  'Person20Address',
  'UserAPI20Endpoint',
];

console.log(words.map((w) => kebabize(w,'-')));

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
  console.warn(`The NODE_ENV of \`${process.env.NODE_ENV}\` is used in secret javascript modules to build the connection strings. Are you sure you are running with the correct build environment?`);
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
  if(isValueType(object)){
    value = object;
  } else {
    value = Buffer.from(
      JSON.stringify(object)
    ).toString('base64');
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


    sails.log(
      `Running custom shell script with NODE_ENV [${process.env.NODE_ENV}]: ... (\n\t\`secrets_relative_paths=secretPath1,secretPath2 NODE_ENV=development sails run secrets-to-env\`\n)`
    );

    const _dir = path.resolve(
      sails.config.appPath,
      `config`
    );

    if(!fs.existsSync(_dir)){
      throw Error(`Directory: "${_dir}" does not exist!`);
    }

    const secrets_relative_paths = process.env.secrets_relative_paths;
    if(!secrets_relative_paths){
      throw Error(
        `Environment variable \`secrets_relative_paths\` is undefined. Please run command secrets_relative_paths="secretPath1,secretPath2" NODE_ENV="production" sails run secrets-to-env`
      );
    }
    const secret_paths = process.env.secrets_relative_paths
      .split(',')
      .map((sp) =>
        path.resolve(sails.config.appPath, sp)
      );

    const output = {};
    let outputSimpleEnv = '';
    for (const sp of secret_paths){
      let bSp = sp;
      try {
        bSp = path.basename(sp);
      } catch (error) {
        sails.warn(`Unable to get basefilename from "${sp}"`);
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
          const mod = require(sp);
          if(sp.endsWith('local.js')){
            const jsonObj = {
              config: mod,
            };
            outputSimpleEnv += convertToEnvBase64(jsonObj, bSp);
            output['sails'] = JSON.stringify(jsonObj);
          }else{
            outputSimpleEnv += convertToEnvBase64(mod, bSp);
            output[bSp] = convertToEnv(mod);
          }
        } catch (error) {
          throw Error(
            `Error trying to require the js file at "${bSp}.\nCheck that this file is a commonjs module with module.exports in the file.\nError:${error}"`
          );
        }

      } else {
        throw Error(
          `Not sure how to process files with extension like this: "${bSp}"`
        );
      }
    }

    const savePathJson = path.resolve(sails.config.appPath, 'out_env.json');

    await sails.helpers.fs.writeJson.with({
      destination: savePathJson,
      json: output,
      force: true,
    });
    let savePathEnv = path.resolve(sails.config.appPath, `.env`);
    
    fs.writeFileSync(
      savePathEnv,
      outputSimpleEnv,
      { encoding: 'utf8', flag: 'w' }
      // (err) => {
      //   if (err) {
      //     sails.log.error(
      //       `Threw writing .env file to "${savePathEnv}".\nError: ${err}`
      //     );
      //   } else {
      //     sails.log(`Env vars written to "${savePathEnv}"`);
      //   }
      // }
    );
    sails.log(`Env vars written to "${savePathEnv}"`);
    for (const bSp of Object.keys(output)){
      let savePathEnvSp = path.resolve(sails.config.appPath, `${bSp}.env`);
      if(bSp === 'sails'){
        savePathEnvSp = path.resolve(sails.config.appPath, `${bSp}.env`);
      }

      fs.writeFileSync(
        savePathEnvSp,
        output[bSp],
        { encoding: 'utf8', flag: 'w' },
        // (err) => {
        //   if (err) {
        //     sails.log.error(
        //       `Threw writing .env file to "${savePathEnv}".\nError: ${err}`
        //     );
        //   } else {
        //     sails.log(`Env vars written to "${savePathEnv}"`);
        //   }
        // }
      );
      sails.log(`Env vars written to "${savePathEnvSp}"`);
    }
    sails.log(`All env vars written!`);

  }

};

