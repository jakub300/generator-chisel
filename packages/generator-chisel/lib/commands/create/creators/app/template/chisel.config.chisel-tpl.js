const creatorData = <%= JSON.stringify(creatorData) %>;

<%
  const isWP = app.projectType == 'wp-with-fe';
  if(isWP) {
    print(`const wp = {
      directoryName: 'wp',
      themeName: '${app.nameSlug}-chisel',
    }`);
  }
%>

module.exports = {
  creatorData,
  <%= !isWP ? '' : `
  wp,
  output: {
    base: \`\${wp.directoryName}/wp-content/themes/\${wp.themeName}/dist\`
  },` %>

  plugins: [
    <%= isWP ? "'chisel-plugin-wordpress'," : '' %>

  ]
}
