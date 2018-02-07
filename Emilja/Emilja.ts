namespace Emilja {
    export async function grep(node: Node, hostEl: Element, component: Component, loopState: ILoopState) {
        node.$component = component;

        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                let
                    el = <Element>node;
                el.$bindings = [];

                await el.$nativeBind(loopState);

                hostEl = el;

                break;
            case Node.TEXT_NODE:

                let
                    fn = getTextFn(node.textContent);
                if (fn)
                    await hostEl.$addBind(new TextBind(node, fn, loopState));
                break;
        }

        for (let i = 0; i < node.childNodes.length; i++) {
            let
                childEl = node.childNodes[i];
            await grep(childEl, hostEl, component, loopState);
        }
    }

    export async function refresh(el: Element = document.body) {
        if (el.$bindings)
            for (let bind of el.$bindings)
                await bind.refresh();

        for (let i = 0; i < el.childNodes.length; i++) {
            let
                childNode = el.childNodes[i];
            if (childNode.nodeType === Node.ELEMENT_NODE)
                await refresh(<Element>childNode);
        }
    }

    export async function execute(fn: () => any) {
        // todo: add execution queue
        try {
            let
                _refresh = await fn();
            if (_refresh !== false)
                await refresh();
        }
        catch (ex) {
            alert(ex.message || ex);
        }
    }
}