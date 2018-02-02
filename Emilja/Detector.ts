namespace Emilja {
    export class Detector {
        private _lastValue: any;

        hasChanged(v: any) {
            if (v !== this._lastValue) {
                this._lastValue = v;
                return true;
            }

            return false;
        }
    }
}