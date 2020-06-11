const creatorData = <%= JSON.stringify(creatorData) %>;

<%
  const isWP = app.projectType == 'wp-with-fe';
  let url = /^https?:\/\//.test(wp.url) ? wp.url : `http://${wp.url}`;
  if(url.endsWith('/')) url = url.slice(0, -1);
  if(isWP) {
    print(`const wp = {
      directoryName: 'wp',
      themeName: '${app.nameSlug}-chisel',
      url: ${JSON.stringify(url)},
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
