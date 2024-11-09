export interface Item {
    _id?: string;
    title: string;
    description: string;
    category: string;
    location: string;
    date?: Date;
    status: string;
    contactInfo: {
      email?: string;
      phone?: string;
    };
    image?: string;
  }