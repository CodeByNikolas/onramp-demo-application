import { Autocomplete, AutocompleteItem, Skeleton } from '@nextui-org/react';
import { Key, useEffect, useMemo } from 'react';
import { useCoinbaseRampTransaction } from '../contexts/CoinbaseRampTransactionContext';
import { generateSellOptions } from '../queries';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
}

export interface Chain {
  id: string;
  name: string;
}

export const ChainTokenSelector = () => {
  const {
    selectedCountry,
    selectedSubdivision,
    selectedPurchaseCurrency,
    setSelectedPurchaseCurrency,
    selectedSellCurrency,
    setSelectedSellCurrency,
    selectedPurchaseCurrencyNetwork,
    setSelectedPurchaseCurrencyNetwork,
    selectedSellCurrencyNetwork,
    setSelectedSellCurrencyNetwork,
    setBuyOptions,
    buyOptions,
    sellOptions,
    setSellOptions,
    setLoadingBuyOptions,
    setLoadingSellOptions,
    loadingBuyOptions,
    isOnrampActive,
  } = useCoinbaseRampTransaction();

  useEffect(() => {
    const getSellOptions = async () => {
      try {
        setLoadingSellOptions(true);
        if (selectedCountry && !sellOptions) {
          const sellOptions = await generateSellOptions({
            country: selectedCountry.id,
            subdivision: selectedSubdivision ? selectedSubdivision : '',
          });

          setSellOptions(sellOptions);
        }
      } catch (error) {
        console.error('Error fetching buy options:', error);
      } finally {
        setLoadingSellOptions(false);
      }
    };

    getSellOptions();
  }, [
    selectedCountry,
    selectedSubdivision,
    buyOptions,
    setBuyOptions,
    setLoadingBuyOptions,
    isOnrampActive,
    setLoadingSellOptions,
    sellOptions,
    setSellOptions,
  ]);

  const handleTokenSelectionChange = (key: Key | null) => {
    if (key) {
      if (isOnrampActive) {
        const selectedPurchaseCurrency = buyOptions?.purchaseCurrencies.find(
          (pc) => pc.id === key
        );

        if (selectedPurchaseCurrency) {
          setSelectedPurchaseCurrency(selectedPurchaseCurrency);
          setSelectedPurchaseCurrencyNetwork(
            selectedPurchaseCurrency.networks.find(
              (network) => network.name.toUpperCase() === 'BASE'
            ) || selectedPurchaseCurrency.networks[0]
          );
        }
      } else {
        const selectedSellCurrency = sellOptions?.sell_currencies.find(
          (pc) => pc.id === key
        );

        if (selectedSellCurrency) {
          setSelectedSellCurrency(selectedSellCurrency);
          setSelectedSellCurrencyNetwork(
            selectedSellCurrency.networks.find(
              (network) => network.name.toUpperCase() === 'BASE'
            ) || selectedSellCurrency.networks[0]
          );
        }
      }
    }
  };

  const handleNetworkSelectionChange = (key: Key | null) => {
    if (key) {
      if (isOnrampActive) {
        const selectedNetwork = selectedPurchaseCurrency?.networks.find(
          (n) => n.displayName === key
        );

        if (selectedNetwork) {
          setSelectedPurchaseCurrencyNetwork(selectedNetwork);
        }
      } else {
        // Offramp
        const selectedNetwork = selectedSellCurrency?.networks.find(
          (n) => n.display_name === key
        );

        if (selectedNetwork) {
          setSelectedSellCurrencyNetwork(selectedNetwork);
        }
      }
    } else {
      setSelectedPurchaseCurrencyNetwork(null);
      setSelectedSellCurrencyNetwork(null);
    }
  };

  const getSelectedCurrency = () => {
    return isOnrampActive
      ? selectedPurchaseCurrency?.id
      : selectedSellCurrency?.id;
  };

  const networkDisplayNames = useMemo(() => {
    if (isOnrampActive) {
      return (selectedPurchaseCurrency?.networks ?? []).map(
        ({ displayName }) => displayName
      );
    }

    return (selectedSellCurrency?.networks ?? []).map(
      ({ display_name }) => display_name
    );
  }, [isOnrampActive, selectedPurchaseCurrency, selectedSellCurrency]);

  return (
    <div className="flex flex-col gap-4">
      {loadingBuyOptions ? (
        <>
          <Skeleton className="h-10 w-[200px] rounded-lg" />
          <Skeleton className="h-10 w-[200px] rounded-lg" />
        </>
      ) : (
        <>
          <Autocomplete
            isClearable={false}
            isLoading={loadingBuyOptions}
            label={isOnrampActive ? 'Buy' : 'Sell'}
            placeholder="Search for a token"
            className="max-w-[200px]"
            onSelectionChange={handleTokenSelectionChange}
            selectedKey={getSelectedCurrency()}
          >
            {(
              (isOnrampActive
                ? buyOptions?.purchaseCurrencies
                : sellOptions?.sell_currencies) || []
            ).map((purchaseCurrency) => (
              <AutocompleteItem
                key={purchaseCurrency.id}
                value={purchaseCurrency.name}
              >
                {purchaseCurrency.name}
              </AutocompleteItem>
            ))}
          </Autocomplete>

          <Autocomplete
            isClearable={false}
            label="Network"
            placeholder="Receiving Network"
            className="max-w-[200px]"
            onSelectionChange={handleNetworkSelectionChange}
            selectedKey={
              isOnrampActive
                ? selectedPurchaseCurrencyNetwork?.displayName
                : selectedSellCurrencyNetwork?.display_name
            }
          >
            {networkDisplayNames.map((networkDisplayName) => (
              <AutocompleteItem
                key={networkDisplayName}
                value={networkDisplayName}
                className="capitalize"
              >
                {networkDisplayName}
              </AutocompleteItem>
            ))}
          </Autocomplete>
        </>
      )}
    </div>
  );
};
