module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "module:react-native-dotenv",
      {
        moduleName: "@env",
        path: ".env",
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    // Añadir plugins de manera consistente y en modo "loose"
    [
      "@babel/plugin-transform-private-methods",
      {
        loose: true, // Activar el modo "loose" en todos los plugins relacionados
      },
    ],
    [
      "@babel/plugin-transform-class-properties",
      {
        loose: true, // Activar el modo "loose"
      },
    ],
    [
      "@babel/plugin-transform-private-property-in-object",
      {
        loose: true, // Activar el modo "loose"
      },
    ],
  ],
};
