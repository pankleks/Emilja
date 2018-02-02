namespace Emilja {

    @Template({
        url: "Emilja/Tests/App.html",
        tag: "ej-app"
    })
    class App extends Component {
        _hello = "Hello!"
        n = 10;
        z = 5;
        _on = true;
    }

    @Template({
        url: "Emilja/Tests/Test.html",
        tag: "ej-test"
    })
    class Test extends Component {
        _v = 0;

        click() {
            this.emitEvent("click", this._v);
        }
    }

    @Template({
        body: "<input type='text' ej-bind='_v'></input> target = ${_target}",
        tag: "ej-input"
    })
    class FunkyInput extends BindableComponent<number> {
        @Monit<FunkyInput>(self => {
            self.boundValueChanged(self._v);
        })
        _v = 0;

        @Input<FunkyInput>("target", self => {                     
        })
        _target = 1;

        setBoundValue(v) {
            this._v = v;
        }
    } 
    
    @Template({
        body: "<tr><td>AAA</td></tr>",
        tag: "pl-row"
    })
    class Row extends Component {        
    }
}