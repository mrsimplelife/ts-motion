import { BaseComponent } from "../../component.js";
import { MediaData } from "../dialog.js";

export class MediaSectionInput
  extends BaseComponent<HTMLElement>
  implements MediaData {
  constructor() {
    super(`<div>
            <div class="form__container">
                <label for="title">title</label>
                <input type="text" id="title" />
            </div>
            <div class="form__container">
                <label for="url">url</label>
                <textarea id="url" rows="3"></textarea>
            </div>
        </div>`);
  }
  get title(): string {
    const element = this.element.querySelector("#title")! as HTMLInputElement;
    return element.value;
  }
  get url(): string {
    const element = this.element.querySelector("#url")! as HTMLInputElement;
    return element.value;
  }
}
