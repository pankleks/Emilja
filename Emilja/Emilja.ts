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

    export async function refresh(debug: string) {
        console.log(`* ${debug}`);
        refreshNode(document.body);
    }

    async function refreshNode(node: Node) {
        if (node.$bindings)
            for (let bind of node.$bindings)
                await bind.refresh();

        for (let i = 0; i < node.childNodes.length; i++) {
            let
                childNode = node.childNodes[i];

            await refreshNode(<Element>childNode);
        }
    }

    export async function execute(fn: () => any, debug: string) {
        // todo: add execution queue
        try {
            let
                _refresh = await fn();
            if (_refresh !== false)
                await refresh(debug);
        }
        catch (ex) {
            service.error.processEx(ex);
        }
    }
}