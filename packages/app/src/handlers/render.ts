import path from "path";
import {fileURLToPath} from "url";
import {Eta} from "eta";

const currentDirname = path.dirname(fileURLToPath(import.meta['url']))

const viewsDirectory = path.join(currentDirname, "..", "views");

export function createRenderTemplate() {

    const eta = new Eta({
        views: viewsDirectory,
        defaultExtension: '.html'
    });

    return (view: string, data: object = {}): string => {
        return eta.render(view, data)
    }
}