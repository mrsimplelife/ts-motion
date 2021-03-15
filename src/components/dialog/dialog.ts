import { BaseComponent, Component } from "../component.js";
import { Composable } from "../page/page.js";
type OnCloseListener = () => void;
type OnSubmitListener = () => void;
export class InputDialog
  extends BaseComponent<HTMLElement>
  implements Composable {
  private closeListener?: OnCloseListener;
  private submitListener?: OnSubmitListener;
  constructor() {
    super(`<dialog class="dialog">
            <div class="dialog__container">
              <button class="close">⊠</button>
              <div id="dialog__body"></div>
              <button class="dialog__submit">ADD</button>
            </div>
          </dialog>`);
    const closeBtn = this.element.querySelector(".close")! as HTMLButtonElement;
    closeBtn.addEventListener("click", () => {
      this.closeListener && this.closeListener();
    });
    const submitBtn = this.element.querySelector(
      ".dialog__submit"
    ) as HTMLButtonElement;
    submitBtn.onclick = () => {
      this.submitListener && this.submitListener();
    };
  }
  addChild(child: Component): void {
    const body = this.element.querySelector(".dialog__body")! as HTMLElement;
    child.attachTo(body);
  }
  setOnCloseListener(listener: OnCloseListener) {
    this.closeListener = listener;
  }
  setOnSubmitListener(listener: OnSubmitListener) {
    this.submitListener = listener;
  }
}
