import { LightningElement, track}  from 'lwc';
import { ShowToastEvent }           from 'lightning/platformShowToastEvent';
import getAddressByCep              from '@salesforce/apex/ViaCepController.getAddressByCep';
import saveAddress                  from '@salesforce/apex/AddressController.saveAddress';

export default class AddressComponent extends LightningElement {
    @track address  = null;
    @track cep      = '';
    formattedCep    = '';
    street          = '';
    number          = '';
    complement      = '';
    neighborhood    = '';
    city            = '';
    state           = '';
    observation     = '';

    handleCepChange(event) {
        const rawValue          = event.target.value;
        const alphanumericValue = this.extractNumbers(rawValue);

        if (alphanumericValue.length > 8) {
            this.showToast('Warning', 'CEP should be 8 digits.', 'warning');
            return;
        }

        this.formattedCep   = this.formatCep(alphanumericValue);
        this.cep            = alphanumericValue;

        if (!this.isCepValid(this.cep)) {
            this.resetAddress();
            return;
        }

        this.fetchAddress();
    }

    isCepValid(cep) {
        return cep.length === 8;
    }

    async fetchAddress() {
        this.resetAddress();
        try {
            const result = await getAddressByCep({ cep: this.cep });

            if (!result && !result.street) {
                this.showToast('Error', 'Address not found.', 'error');
                return;
            }

            this.address = result;
            this.showToast('Success', 'Address found successfully.', 'success');

        } catch (error) {
            this.resetAddress();
            this.showToast('Error', 'Error fetching address. Please try again later.', 'error');
            console.error('Error fetching address:', error);
        }
    }

    formatCep(value) {
        const numbersOnly = this.extractNumbers(value);
        if (numbersOnly.length > 5) {
            return `${numbersOnly.substring(0, 5)}-${numbersOnly.substring(5, 8)}`;
        }
        return numbersOnly;
    }

    extractNumbers(value) {
        return value.replace(/\D/g, '');
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    handleSave() {
        const addressData = this.collectAddressData();

        saveAddress({ addressData })
            .then(() => {
                this.showToast('Success', 'Address saved successfully.', 'success');
                this.resetAllFields();
            })
            .catch((error) => {
                this.showToast('Error', 'Error saving address. Please try again later.', 'error');
                console.error('Error saving address:', error);
            });
    }

    collectAddressData() {
        return {
            cep__c:             this.cep,
            street__c:          this.street,
            number__c:          this.number,
            complement__c:      this.complement,
            neighborhood__c:    this.neighborhood,
            city__c:            this.city,
            state__c:           this.state,
            observation__c:     this.observation
        };
    }

    resetAddress() {
        this.address = null;
    }

    resetAllFields() {
        this.resetAddress();
        this.cep = '';
        this.formattedCep = '';
        this.street = '';
        this.number = '';
        this.complement = '';
        this.neighborhood = '';
        this.city = '';
        this.state = '';
        this.observation = '';
    }
}