import { tsLibConfig } from '../build/src/rollup.base';

import pkg from './package.json';

export default tsLibConfig(pkg, './src/index.ts');
