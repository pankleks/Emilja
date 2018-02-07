namespace Emilja {
    export class ErrorService {
        processEx(ex: Error) {
            alert(ex.message || ex);
        }
    }

    export const service = {
        error: new ErrorService()
    }
}