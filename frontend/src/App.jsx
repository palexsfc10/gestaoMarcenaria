import { useState } from "react";
import { api } from "./api";
import "./App.css";

function App() {
  const [logged, setLogged] = useState(false);
  const [screen, setScreen] = useState("login");
  const [clientId, setClientId] = useState(null);

  async function login(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    try {
      await api.post("/login", {
        username: form.get("username"),
        password: form.get("password"),
      });
      setLogged(true);
      setScreen("setup");
    } catch {
      alert("Login inválido");
    }
  }

  async function saveCompany(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    await api.post("/company/setup", {
      name: form.get("name"),
      document: form.get("document"),
      phone: form.get("phone"),
      whatsapp: form.get("whatsapp"),
      email: form.get("email"),
      address: form.get("address"),
      responsible: form.get("responsible"),
      pix: form.get("pix"),
      default_notes: form.get("default_notes"),
    });

    alert("Empresa salva!");
    setScreen("client");
  }

  async function saveClient(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    const response = await api.post("/clients", {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email"),
      address: form.get("address"),
    });

    setClientId(response.data.id);
    alert("Cliente salvo!");
    setScreen("budget");
  }

  async function saveBudget(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    const response = await api.post("/budgets", {
      client_id: clientId,
      title: form.get("title"),
      description: form.get("description"),
      environment: form.get("environment"),
      delivery_time: form.get("delivery_time"),
      payment_method: form.get("payment_method"),
      validity: form.get("validity"),
      notes: form.get("notes"),
      discount: Number(form.get("discount") || 0),
      extra_cost: Number(form.get("extra_cost") || 0),
      items: [
        {
          description: form.get("item1_description"),
          quantity: Number(form.get("item1_quantity")),
          unit_price: Number(form.get("item1_price")),
        },
        {
          description: form.get("item2_description"),
          quantity: Number(form.get("item2_quantity") || 0),
          unit_price: Number(form.get("item2_price") || 0),
        },
      ].filter((item) => item.description && item.quantity > 0),
    });

    alert("Orçamento criado!");
    window.open(`http://localhost:8000/budgets/${response.data.id}/pdf`, "_blank");
  }

  if (!logged) {
    return (
      <div className="container">
        <h1>OrçaFlow</h1>
        <h2>Login</h2>

        <form onSubmit={login}>
          <input name="username" placeholder="Usuário" defaultValue="admin" />
          <input name="password" placeholder="Senha" type="password" defaultValue="admin123" />
          <button>Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>OrçaFlow</h1>

      <nav>
        <button onClick={() => setScreen("setup")}>Empresa</button>
        <button onClick={() => setScreen("client")}>Cliente</button>
        <button onClick={() => setScreen("budget")}>Orçamento</button>
      </nav>

      {screen === "setup" && (
        <>
          <h2>Setup da Marcenaria</h2>
          <form onSubmit={saveCompany}>
            <input name="name" placeholder="Nome da marcenaria" required />
            <input name="document" placeholder="CNPJ ou CPF" />
            <input name="phone" placeholder="Telefone" />
            <input name="whatsapp" placeholder="WhatsApp" />
            <input name="email" placeholder="E-mail" />
            <input name="address" placeholder="Endereço" />
            <input name="responsible" placeholder="Responsável" />
            <input name="pix" placeholder="Chave Pix" />
            <textarea name="default_notes" placeholder="Observações padrão" />
            <button>Salvar empresa</button>
          </form>
        </>
      )}

      {screen === "client" && (
        <>
          <h2>Cadastrar Cliente</h2>
          <form onSubmit={saveClient}>
            <input name="name" placeholder="Nome do cliente" required />
            <input name="phone" placeholder="Telefone" />
            <input name="email" placeholder="E-mail" />
            <input name="address" placeholder="Endereço" />
            <button>Salvar cliente</button>
          </form>
        </>
      )}

      {screen === "budget" && (
        <>
          <h2>Criar Orçamento</h2>

          {!clientId && <p>Cadastre um cliente antes de criar o orçamento.</p>}

          <form onSubmit={saveBudget}>
            <input name="title" placeholder="Título do orçamento" required />
            <input name="environment" placeholder="Ambiente: cozinha, quarto..." />
            <textarea name="description" placeholder="Descrição do projeto" />

            <h3>Item 1</h3>
            <input name="item1_description" placeholder="Descrição do item" required />
            <input name="item1_quantity" placeholder="Quantidade" type="number" defaultValue="1" />
            <input name="item1_price" placeholder="Valor unitário" type="number" required />

            <h3>Item 2</h3>
            <input name="item2_description" placeholder="Descrição do item" />
            <input name="item2_quantity" placeholder="Quantidade" type="number" />
            <input name="item2_price" placeholder="Valor unitário" type="number" />

            <input name="discount" placeholder="Desconto" type="number" defaultValue="0" />
            <input name="extra_cost" placeholder="Acréscimo/Frete" type="number" defaultValue="0" />
            <input name="delivery_time" placeholder="Prazo de entrega" />
            <input name="payment_method" placeholder="Forma de pagamento" />
            <input name="validity" placeholder="Validade do orçamento" />
            <textarea name="notes" placeholder="Observações" />

            <button disabled={!clientId}>Criar orçamento e gerar PDF</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;