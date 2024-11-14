export interface Item {
    _id?: string;
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    status: string;
    contactInfo: {
      name: string;
      email: string;
      phone?: string;
    };
    image?: string;
  }