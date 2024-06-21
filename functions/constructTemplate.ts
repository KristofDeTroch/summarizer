import Handlebars from "handlebars";

export async function constructTemplate(data: any[]) {
  const templateFile = await Bun.file("html/summary.html").text();
  const template = Handlebars.compile(templateFile);
  return template({ data });
}
