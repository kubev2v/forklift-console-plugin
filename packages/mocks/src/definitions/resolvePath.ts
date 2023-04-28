import basic from './basic/paths';

const toDataSet = (dataSet: string) => (dataSet === 'basic' ? basic : {});

export const resolvePath = (path: string, dataSet = 'basic') => toDataSet(dataSet)[path];
