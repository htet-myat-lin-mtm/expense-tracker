export const formatCurrency = (value: number, currency: string = 'MMK'): string => {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2
    }).format(value);
}