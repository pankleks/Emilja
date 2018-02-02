namespace Emilja {
    export abstract class Component extends HTMLElement {
        static _id = 0;

        constructor() {
            super();

            this.$componentId = Component._id++;
        }

        get _ctor() {
            return <IComponentCtor>this.constructor;
        }

        private async getTemplate() {
            if (this._ctor.template.body)
                return this._ctor.template.body;

            if (this._ctor.template.url) {
                let
                    data = await fetch(this._ctor.template.url);
                if (data.ok)
                    return data.text();

                throw new Error(`EJ-0001: Can't load template [${this._ctor.template.url}]`);
            }

            throw new Error(`EJ-0002: No [body] or [url] is set.`);
        }

        private async connectedCallback() {
            if (!this._ctor.templateDocument) {
                let
                    fragment = document.createDocumentFragment(),
                    el = document.createElement("div");

                if (!this._ctor._p)
                    this._ctor._p = this.getTemplate();

                el.innerHTML = await this._ctor._p;

                while (el.firstChild)
                    fragment.appendChild(el.firstChild);

                this._ctor.templateDocument = fragment;
            }

            let
                contentDocument = this._ctor.templateDocument.cloneNode(true);

            await grep(contentDocument, this, this, {});
            this.appendChild(contentDocument);
        }

        private attributeChangedCallback(name: string, lastV: any, v: any) {
            let
                input = this._ctor.inputs[name];
            if (input) {
                this[input.key] = v;
                if (typeof input.fn === "function")
                    execute(() => input.fn(this));
            }
        }

        static get observedAttributes(this: IComponentCtor) {
            return this.inputs ? Object.keys(this.inputs) : [];
        }

        protected emitEvent(name: string, data: any) {
            let
                ev = new CustomEvent(name + this.$componentId, { detail: data });
            this.dispatchEvent(ev);
        }
    }

    export abstract class BindableComponent<T> extends Component {
        abstract setBoundValue(v: T)

        boundValueChanged(v: T) {
        }
    }
}