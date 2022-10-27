export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

type MainService = {
    type: "MAIN",
    serviceType: ServiceType
}

type AdditionalService = {
    type: "ADDITIONAL",
    serviceType: ServiceType,
    requiresAny: ServiceType[]
}

type ServiceInOffer = MainService | AdditionalService;

const servicesOffer : ServiceInOffer[] = [
    {
        type: "MAIN",
        serviceType: "Photography"
    },
    {
        type: "MAIN",
        serviceType: "VideoRecording"
    },
    {
        type: "MAIN",
        serviceType: "WeddingSession"
    },
    {
        type: "ADDITIONAL",
        serviceType: "BlurayPackage",
        requiresAny: ["VideoRecording"]
    },
    {
        type: "ADDITIONAL",
        serviceType: "TwoDayEvent",
        requiresAny: ["Photography", "VideoRecording"]
    }
];

const containsRequiredService = (service: AdditionalService, selectedServices: ServiceType[]) => {
    return selectedServices.some(x => service.requiresAny.includes(x));
}

const canAddService = (service: ServiceType, selectedServices: ServiceType[]) => {
    if (selectedServices.includes(service))
        return false;

    const serviceOffer = servicesOffer.find(so => so.serviceType === service);
    if (serviceOffer.type === "ADDITIONAL") {
        return containsRequiredService(serviceOffer, selectedServices);
    }
    return true;
}

const deselectAdditionalServicesWithoutRequiredMainService = (selectedServices: ServiceType[]) => 
    selectedServices
    .map(s => servicesOffer.find(so => so.serviceType === s))
    .filter(so => so.type === "MAIN" || containsRequiredService(so, selectedServices))
    .map(so => so.serviceType);

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
) => {
    switch (action.type){
        case "Select":
            return canAddService(action.service, previouslySelectedServices)
                ? [...previouslySelectedServices, action.service]
                : [...previouslySelectedServices];
        case "Deselect":
            var selectedServices = previouslySelectedServices
                .filter(x => x !== action.service);

            var finalSelectedServices = deselectAdditionalServicesWithoutRequiredMainService(selectedServices);

            return finalSelectedServices;
        default:
            return [...previouslySelectedServices];
    }
}

type ServicePrice = {
    serviceType: ServiceType,
    price: number
}

type Discount = {
    service: ServiceType,
    requiresAny: ServiceType[],
    amount: number
}

type PricesOffer = {
    year: ServiceYear,
    servicePrices: ServicePrice[],
    discounts: Discount[]
}

const yearsPricesOffers: PricesOffer[] = [
    {
        year: 2020,
        servicePrices: [
            {
                serviceType: "Photography",
                price: 1700
            },
            {
                serviceType: "VideoRecording",
                price: 1700
            },
            {
                serviceType: "WeddingSession",
                price: 600
            },
            {
                serviceType: "BlurayPackage",
                price: 300
            },
            {
                serviceType: "TwoDayEvent",
                price: 400
            }
        ],
        discounts: [
            {
                service: "Photography",
                requiresAny: ["VideoRecording"],
                amount: 1200
            }
        ]
    },
    {
        year: 2021,
        servicePrices: [
            {
                serviceType: "Photography",
                price: 1800
            },
            {
                serviceType: "VideoRecording",
                price: 1800
            },
            {
                serviceType: "WeddingSession",
                price: 600
            },
            {
                serviceType: "BlurayPackage",
                price: 300
            },
            {
                serviceType: "TwoDayEvent",
                price: 400
            }
        ],
        discounts: [
            {
                service: "Photography",
                requiresAny: ["VideoRecording"],
                amount: 1300
            }
        ]
    },
    {
        year: 2022,
        servicePrices: [
            {
                serviceType: "Photography",
                price: 1900
            },
            {
                serviceType: "VideoRecording",
                price: 1900
            },
            {
                serviceType: "WeddingSession",
                price: 600
            },
            {
                serviceType: "BlurayPackage",
                price: 300
            },
            {
                serviceType: "TwoDayEvent",
                price: 400
            }
        ],
        discounts: [
            {
                service: "Photography",
                requiresAny: ["VideoRecording"],
                amount: 1300
            }
        ]
    }
]

const canApplyDiscount = (discount: Discount, selectedServices: ServiceType[]) => {
    return selectedServices.includes(discount.service) 
        && selectedServices.some(x => discount.requiresAny.includes(x));
}

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
    var priceList = yearsPricesOffers.find(x => x.year === selectedYear);

    var basePrice = selectedServices
        .map(s => priceList.servicePrices.find(p => p.serviceType === s).price)
        .reduce((acc, v) => acc + v, 0);

    var discounts = priceList.discounts.filter(d => canApplyDiscount(d, selectedServices));

    var finalPrice =  basePrice 
    
    if (discounts.length > 0)
        finalPrice -= discounts[0].amount;

    return ({ basePrice, finalPrice });
}

