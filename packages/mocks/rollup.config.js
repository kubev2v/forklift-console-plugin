import { tsLibConfig } from '../../config/rollup.base';

import pkg from './package.json';

export default tsLibConfig(pkg, './src/index.ts');
