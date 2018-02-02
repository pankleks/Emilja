namespace Emilja {
    function createDocumentFragment(body: string) {
        let
            fragment = document.createDocumentFragment(),
            el = document.createElement("div");

        el.innerHTML = body;

        while (el.firstChild)
            fragment.appendChild(el.firstChild);

        return fragment;
    }

    export interface IComponentCtor {
        new(...p): Component;

        template?: IComponentTemplate;
        _document?: Promise<DocumentFragment>;

        inputs?: {
            [name: string]: {
                key: string;
                fn: (self: Component) => any;
            }
        };
    }

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
                return createDocumentFragment(this._ctor.template.body);

            if (this._ctor.template.url) {
                let
                    data = await fetch(this._ctor.template.url);
                if (data.ok)
                    return createDocumentFragment(await data.text());

                throw new Error(`Can't load template [${this._ctor.template.url}]`);
            }

            // use inner HTML
            let
                fragment = document.createDocumentFragment();
            while (this.firstChild)
                fragment.appendChild(this.firstChild);
            return fragment;
        }

        private async connectedCallback() {
            if (!this._ctor._document)
                this._ctor._document = this.getTemplate();

            let
                contentDocument = (await this._ctor._document).cloneNode(true);

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

    // export class FancyTR extends HTMLTableRowElement {
    //     connectedCallback() {
    //         this.innerHTML = "<td>AAA</td>";
    //     }
    // }

    // customElements.define('fancy-tr', FancyTR, { extends: 'tr' });
}