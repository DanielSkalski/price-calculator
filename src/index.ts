import _ from 'lodash';

export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

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

            selectedServices = excludeAdditionalServicesWithoutRequiredMainService(selectedServices);

            return selectedServices;
        default:
            return [...previouslySelectedServices];
    }
}

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
    var prices = getPricesFor(selectedYear);
    var servicesForPricing = getServicesForPricing(selectedServices);

    var basePrice = calculateBasePrice(prices, servicesForPricing);

    const discount = calculateDiscount(prices, servicesForPricing);
    const finalPrice = basePrice - discount;

    return ({ basePrice, finalPrice });
}

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

const servicesInOffer : ServiceInOffer[] = [
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

const containsRequiredService = (service: AdditionalService, selectedServices: ServiceType[]) =>
    selectedServices.some(x => service.requiresAny.includes(x));

const canAddService = (service: ServiceType, selectedServices: ServiceType[]) => {
    if (selectedServices.includes(service))
        return false;

    const serviceOffer = servicesInOffer.find(so => so.serviceType === service);
    if (serviceOffer.type === "ADDITIONAL") {
        return containsRequiredService(serviceOffer, selectedServices);
    }

    return true;
}

const excludeAdditionalServicesWithoutRequiredMainService = (selectedServices: ServiceType[]) => 
    selectedServices
    .map(s => servicesInOffer.find(so => so.serviceType === s))
    .filter(so => so.type === "MAIN" || containsRequiredService(so, selectedServices))
    .map(so => so.serviceType);

type ServicePrice = {
    serviceType: ServiceType,
    price: number
}

type DiscountWhen = {
    with: ServiceType,
    amount: number
}

type Discount = {
    onService: ServiceType,
    when: DiscountWhen[]
}

type PricesOffer = {
    year: ServiceYear,
    servicePrices: ServicePrice[],
    discounts: Discount[]
}

const priceOfferByYear: PricesOffer[] = [
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
                onService: "Photography",
                when: [ { with: "VideoRecording", amount: 1200 } ]
            },
            {
                onService: "WeddingSession",
                when: [
                    { with: "Photography", amount: 300 },
                    { with: "VideoRecording", amount: 300 },
                ]
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
                onService: "Photography",
                when: [ { with: "VideoRecording", amount: 1300 } ]
            },
            {
                onService: "WeddingSession",
                when: [
                    { with: "Photography", amount: 300 },
                    { with: "VideoRecording", amount: 300 },
                ]
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
                onService: "Photography",
                when: [ { with: "VideoRecording", amount: 1300 } ]
            },
            {
                onService: "WeddingSession",
                when: [
                    { with: "Photography", amount: 600 },
                    { with: "VideoRecording", amount: 300 },
                ]
            }
        ]
    }
]

const getPricesFor = (year: ServiceYear) => 
    priceOfferByYear.find(x => x.year === year);

const getServicesForPricing = (services: ServiceType[]) =>
    excludeAdditionalServicesWithoutRequiredMainService(services);

const calculateBasePrice = (prices: PricesOffer, services: ServiceType[]) => 
    _.sum(services.map(service => getPriceForService(prices, service)));

const getPriceForService = (prices: PricesOffer, service: ServiceType) => 
    prices.servicePrices.find(p => p.serviceType === service).price;

const calculateDiscount = (prices: PricesOffer, services: ServiceType[]) => {
    var discounts = prices.discounts
        .filter(d => canApplyDiscount(d, services))
        .map(d => getDiscountAmount(d, services));

    return _.sum(discounts);
}

const canApplyDiscount = (discount: Discount, selectedServices: ServiceType[]) => {
    return selectedServices.includes(discount.onService) 
        && selectedServices.some(service => discount.when.some(w => w.with == service));
}

const getDiscountAmount = (discount: Discount, selectedServices: ServiceType[]) => {
    const applicableDiscountAmounts = discount.when
        .filter(d => selectedServices.includes(d.with))
        .map(d => d.amount);

    return _.max(applicableDiscountAmounts);
}
