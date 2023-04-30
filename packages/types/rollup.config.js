import { tsLibConfig } from '../../config/rollup-configs';

import pkg from './package.json';

export default tsLibConfig(pkg, './src/index.ts');
