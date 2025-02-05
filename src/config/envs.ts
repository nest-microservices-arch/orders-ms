import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  // PRODUCTS_MICROSERVICE_HOST: string;
  // PRODUCTS_MICROSERVICE_PORT: number;
  // DATABASE_URL: string;
}

const envsSchema = joi
  .object<EnvVars>({
    PORT: joi.number().required(),
    // PRODUCTS_MICROSERVICE_HOST: joi.string().required(),
    // PRODUCTS_MICROSERVICE_PORT: joi.number().required(),
    // DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

const validation = envsSchema.validate(process.env);

if (validation.error) {
  throw new Error(`Error validating envs: ${validation.error.message}`);
}

const envVars: EnvVars = validation.value;

export const envs = {
  PORT: envVars.PORT,
  // PRODUCTS_MICROSERVICE_HOST: envVars.PRODUCTS_MICROSERVICE_HOST,
  // PRODUCTS_MICROSERVICE_PORT: envVars.PRODUCTS_MICROSERVICE_PORT,
};
