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

            var finalSelectedServices = selectedServices
                .map(s => servicesOffer.find(so => so.serviceType === s))
                .filter(so => so.type === "MAIN" || containsRequiredService(so, selectedServices))
                .map(so => so.serviceType);

            return finalSelectedServices;
        default:
            return [...previouslySelectedServices];
    }
}

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => ({ basePrice: 0, finalPrice: 0 });