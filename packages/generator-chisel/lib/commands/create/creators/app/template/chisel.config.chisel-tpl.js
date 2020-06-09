const creatorData = <%= JSON.stringify(creatorData) %>;

<%
  const isWP = app.projectType == 'wp-with-fe';
  if(isWP) {
    print(`const wpDirectoryName = 'wp';`);
    print(`const wpThemeName = '${app.nameSlug}-chisel';`);
  }
%>

module.exports = {
  creatorData,
  <%= !isWP ? '' : `output: {
    base: \`\${wpDirectoryName}/wp-content/themes/\${wpThemeName}/dist\`
  },` %>

  plugins: [
    <%= isWP ? "'chisel-plugin-wordpress'," : '' %>

  ]
}
