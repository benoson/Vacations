export default class Vacation {

    public constructor(
        public vacationID: number,
        public vacationName: string,
        public vacationDescription: string,
        public vacationPrice: number,
        public startDate: string,
        public endDate: string,
        public imageURL: string,
        public followersCount: number
    ) {}
    
}