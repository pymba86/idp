import path from "path";
import {fileURLToPath} from "url";
import {Eta} from "eta";

export const createTemplate = () => new Eta({
    views: path.join(
        path.dirname(fileURLToPath(import.meta['url'])),
        "..",
        "views"
    ),
    tags: ['{{', '}}'],
    defaultExtension: '.html'
})