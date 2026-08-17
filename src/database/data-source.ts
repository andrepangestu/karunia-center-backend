import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/typeorm.config';

config();

export default new DataSource(createDataSourceOptions(process.env));
