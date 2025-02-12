import { OnrampPaymentMethod } from '@coinbase/onchainkit/fund';
import { Autocomplete, AutocompleteItem, Skeleton } from '@nextui-org/react';
import { Key, useState } from 'react';
import { useCoinbaseRampTransaction } from '../contexts/CoinbaseRampTransactionContext';

export const CurrencySelector = () => {
  const {
    isOnrampActive,
    isOfframpActive,
    sellOptions,
    buyOptions,
    setRampTransaction,
    rampTransaction,
    setSelectedPaymentMethod,
    selectedCurrency,
    selectedCountry,
    setSelectedCurrency,
    loadingBuyOptions,
  } = useCoinbaseRampTransaction();

  const [currencyInputValue, setCurrencyInputValue] = useState('');
  const [userFocusOnCurrencyInput, setUserFocusOnCurrencyInput] =
    useState(false);

  const handleCurrencySelection = (value: Key | null) => {
    if (value) {
      if (isOnrampActive && buyOptions) {
        const newCurrency =
          buyOptions.paymentCurrencies.find(
            (currency) => currency.id === value
          ) || null;
        setSelectedCurrency(newCurrency);
        setRampTransaction({
          ...rampTransaction,
          currency: newCurrency?.id,
        });
      } else if (isOfframpActive && sellOptions) {
        const newCurrency =
          sellOptions.cashout_currencies.find(
            (currency) => currency.id === value
          ) || null;
        setSelectedCurrency(newCurrency);
        setRampTransaction({
          ...rampTransaction,
          currency: newCurrency?.id,
        });
      }
    }
  };

  const handlePaymentMethodSelection = (key: Key | null) => {
    const method = selectedCountry?.paymentMethods.find(
      (method) => method.id === key
    );

    if (method) {
      setSelectedPaymentMethod(method);
      setRampTransaction({
        ...rampTransaction,
        paymentMethod: method.id,
      });
    }
  };

  const getCurrencies = () => {
    return (
      (isOnrampActive
        ? buyOptions?.paymentCurrencies
        : sellOptions?.cashout_currencies) || []
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        {!loadingBuyOptions ? (
          <>
            <Autocomplete
              isClearable={false}
              label="Currency"
              placeholder="Search for a currency"
              className="w-[200px] my-auto"
              onSelectionChange={handleCurrencySelection}
              selectedKey={
                userFocusOnCurrencyInput
                  ? currencyInputValue
                  : rampTransaction?.currency
              }
              onInputChange={setCurrencyInputValue}
              onFocus={() => setUserFocusOnCurrencyInput(true)}
              onFocusChange={() => setUserFocusOnCurrencyInput(false)}
            >
              {getCurrencies().map((currency) => (
                <AutocompleteItem key={currency.id} value={currency.id}>
                  {currency.id}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            {selectedCurrency && (
              <Autocomplete
                isClearable={false}
                label="Payment Method"
                placeholder="Search for a payment method"
                className="w-[200px] my-auto"
                onSelectionChange={handlePaymentMethodSelection}
                selectedKey={rampTransaction?.paymentMethod}
              >
                {(selectedCountry?.paymentMethods || []).map(
                  (paymentMethod: OnrampPaymentMethod) => (
                    <AutocompleteItem
                      key={paymentMethod.id}
                      value={paymentMethod.id}
                    >
                      {paymentMethod.id}
                    </AutocompleteItem>
                  )
                )}
              </Autocomplete>
            )}
          </>
        ) : (
          <>
            <Skeleton className="h-10 w-[200px] rounded-lg" />
            <Skeleton className="h-10 w-[200px] rounded-lg" />
          </>
        )}
      </div>
    </div>
  );
};
