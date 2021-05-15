import ejs from "ejs";
import { TemplateData } from "../interfaces/types";
export function render(content: string, data: TemplateData) {
  return ejs.render(content, data);
}
