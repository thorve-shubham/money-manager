module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Transforms .sql file imports into raw strings (required by drizzle-orm/expo-sqlite migrator)
      ['inline-import', { extensions: ['.sql'] }],
    ],
  };
};
