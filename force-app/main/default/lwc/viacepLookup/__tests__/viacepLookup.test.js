import { createElement } from 'lwc';
import ViacepLookup from 'c/viacepLookup';
import getAddressByCep from '@salesforce/apex/ViaCepController.getAddressByCep';

// Mock da API para retornar uma resposta simulada
const mockResponse = {
    logradouro: 'Rua Exemplo',
    bairro: 'Bairro Exemplo',
    localidade: 'Cidade Exemplo',
    uf: 'SP',
    ibge: '1234567',
    gia: '000',
    ddd: '11',
    siafi: '1234'
};

const mockErrorResponse = {
    body: { message: 'CEP não encontrado' }
};

// Mock da função do Apex
jest.mock('@salesforce/apex/ViaCepController.getAddressByCep', () => ({
    default: jest.fn(() => Promise.resolve(mockResponse))
}));

describe('c-viacep-lookup', () => {
    afterEach(() => {
        // Limpar o DOM após cada teste
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('deve renderizar o componente corretamente', () => {
        const element = createElement('c-viacep-lookup', { is: ViacepLookup });
        document.body.appendChild(element);

        const input = element.shadowRoot.querySelector('lightning-input');
        const button = element.shadowRoot.querySelector('lightning-button');

        // Verifica se o input e o botão estão presentes
        expect(input).not.toBeNull();
        expect(button).not.toBeNull();
    });

    it('deve formatar o CEP corretamente', async () => {
        const element = createElement('c-viacep-lookup', { is: ViacepLookup });
        document.body.appendChild(element);

        const input = element.shadowRoot.querySelector('lightning-input');
        input.value = '03805110';
        input.dispatchEvent(new CustomEvent('change'));

        const button = element.shadowRoot.querySelector('lightning-button');
        button.click();

        await Promise.resolve(); // Aguarda a atualização da UI

        const formattedCep = input.value;
        expect(formattedCep).toBe('03805-110');
    });

    it('deve exibir dados do endereço corretamente', async () => {
        const element = createElement('c-viacep-lookup', { is: ViacepLookup });

        // Mock da função para simular a resposta da API
        getAddressByCep.mockResolvedValue(mockResponse);

        document.body.appendChild(element);

        const input = element.shadowRoot.querySelector('lightning-input');
        input.value = '03805110';
        input.dispatchEvent(new CustomEvent('change'));

        const button = element.shadowRoot.querySelector('lightning-button');
        button.click();

        await Promise.resolve(); // Aguarda a atualização da UI

        const logradouro = element.shadowRoot.querySelector('p').textContent;
        expect(logradouro).toContain('Rua Exemplo');
    });

    it('deve exibir uma mensagem de erro se o CEP não for encontrado', async () => {
        const element = createElement('c-viacep-lookup', { is: ViacepLookup });

        // Mock da função para simular a resposta da API com erro
        getAddressByCep.mockRejectedValue(mockErrorResponse);

        document.body.appendChild(element);

        const input = element.shadowRoot.querySelector('lightning-input');
        input.value = '00000000';
        input.dispatchEvent(new CustomEvent('change'));

        const button = element.shadowRoot.querySelector('lightning-button');
        button.click();

        await Promise.resolve(); // Aguarda a atualização da UI

        const errorMessage = element.shadowRoot.querySelector('.slds-text-color_error').textContent;
        expect(errorMessage).toBe('CEP não encontrado');
    });
});
