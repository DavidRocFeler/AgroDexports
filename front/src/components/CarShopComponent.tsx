import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { ILabelComponentProps, IAgriProduct } from '@/interface/types';
import LabelComponent from './LabelComponent';
import ResumeShopComponent from './ResumeShopComponent';

const MySwal = withReactContent(Swal);

interface PayPalComponentProps {
  amount: number;
  companyId: string; // Agrega companyId aquí
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
}

// fixed 
const PayPalButtonsComponent: React.FC<PayPalComponentProps> = ({ amount, companyId, onSuccess, onError }) => {
  return (
    <div className="bg-white p-6 rounded-lg">
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE', // Añade esta línea para especificar la intención de la transacción
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: amount.toString(),
                },
                custom_id: companyId, // Pasa company_id aquí
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          if (actions.order) {
            await actions.order.capture().then((details) => {
              MySwal.fire({
                icon: 'success',
                title: 'Payment Successful',
                text: 'Your payment has been processed successfully.',
              });
              onSuccess?.(details);
            });
          }
        }}
        onError={(err) => {
          console.error("PayPal Error:", err);
          onError?.(err);
        }}
      />
    </div>
  );
};


const CarShopComponent: React.FC<ILabelComponentProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<IAgriProduct | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProductSelect = (product: IAgriProduct) => {
    setSelectedProduct(selectedProduct?.company_product_id === product.company_product_id ? null : product);
  };

  const calculateTotals = () => {
    if (!selectedProduct || !selectedProduct.company_price_x_kg || !selectedProduct.minimum_order) {
      return { 
        subtotal: 0, 
        logisticsCost: 0, 
        tariff: 0, 
        tax: 0, 
        total: 0,
        productData: null 
      };
    }

    const subtotal = selectedProduct.company_price_x_kg * (selectedProduct.minimum_order * 1000);
    const logisticsCost = subtotal * 0.2;
    const tariff = (subtotal + logisticsCost) * 0.1;
    const tax = logisticsCost + (logisticsCost * 0.18);
    const total = subtotal + logisticsCost + tariff + tax;

    return {
      subtotal,
      logisticsCost,
      tariff,
      tax,
      total,
      productData: {
        company_id: selectedProduct.company_id,
      }
    };
  };

  const handlePaymentProcess = async () => {
    if (!selectedProduct || isProcessing) return;
  
    setIsProcessing(true);
    try {
      // Log para verificar el producto seleccionado
      console.log('Selected Product:', selectedProduct);
  
      const companyId = selectedProduct.company_id; // Asumiendo que el company_id viene de selectedProduct
      const companyAccount = companyData?.account_paypal; // Usa companyData que ya deberías tener en el estado
  
      // Log para verificar el account_paypal
      console.log('Company ID:', companyId);
      console.log('Company Account (PayPal):', companyAccount);
  
      if (!companyAccount) {
        throw new Error('PayPal account not found for this company');
      }
  
      const totals = calculateTotals();
      
      // Log para verificar los totales calculados
      console.log('Calculated Totals:', totals);
  
      // Verifica si productData no es null
      if (totals.productData) {
        MySwal.fire({
          title: 'Complete Your Payment',
          html: (
            <PayPalScriptProvider
              options={{
                clientId: companyAccount, // Utiliza el account_paypal de la compañía
                currency: "USD",
                intent: "capture",
              }}
            >
              <PayPalButtonsComponent
                amount={totals.total}
                companyId={totals.productData.company_id} // Usa company_id de productData
                onSuccess={(details) => {
                  console.log('Payment successful:', details);
                  MySwal.close();
                  // Handle post-payment logic here (e.g., update order status)
                }}
                onError={(error) => {
                  console.error('Payment failed:', error);
                  MySwal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: 'There was an error processing your payment. Please try again.',
                  });
                }}
              />
            </PayPalScriptProvider>
          ),
          showConfirmButton: false,
          showCloseButton: true,
          customClass: {
            popup: 'paypal-popup-class',
          },
        });
      } else {
        throw new Error('Product data is not available.');
      }
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: error instanceof Error ? error.message : 'There was an error processing your payment. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .paypal-popup-class {
        width: 500px !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="flex flex-row pl-[2rem] pr-[2rem] pt-[3rem] pb-[2rem]">
      <div className="w-[60%]">
        {products && products.map((product) => (
          <div key={product.company_product_id}>
            <LabelComponent
              {...product}
              category_id={product.category_id || ''}
              isSelected={selectedProduct?.company_product_id === product.company_product_id}
              onSelect={() => handleProductSelect(product)}
            />
          </div>
        ))}
      </div>
      <div className="ml-auto w-[30%] flex flex-row justify-center">
        <ResumeShopComponent 
          totals={calculateTotals()} 
          onOrderClick={handlePaymentProcess}
          isProductSelected={!!selectedProduct}
        />
      </div>
    </div>
  );
};

export default CarShopComponent;