export default class SuccessfulLoginServerResponse {

    public constructor(
        public token: string,
        public userType: string,
        public userName: string
    ){}

}