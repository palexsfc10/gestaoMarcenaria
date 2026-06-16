import { useState } from "react";
import { api } from "./api";
import "./App.css";

function App() {
  const [logged, setLogged] = useState(false);
  const [screen, setScreen] = useState("login");
  const [company, setCompany] = useState(null);
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

      const companyResponse = await api.get("/company");

      if (companyResponse.data) {
        setCompany(companyResponse.data);
        setScreen("home");
      } else {
        setScreen("setup");
      }
    } catch {
      alert("Login inválido");
    }
  }

  async function saveCompany(e) {
    e.preventDefault();

    const form = new FormData(e.target);

    const response = await api.post("/company/setup", {
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

    setCompany(response.data);
    alert("Dados da empresa salvos!");
    setScreen("home");
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

    const items = [
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
      {
        description: form.get("item3_description"),
        quantity: Number(form.get("item3_quantity") || 0),
        unit_price: Number(form.get("item3_price") || 0),
      },
    ].filter((item) => item.description && item.quantity > 0);

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
      items,
    });

    alert("Orçamento criado!");
    window.open(`http://localhost:8000/budgets/${response.data.id}/pdf`, "_blank");
    setScreen("home");
  }

  function startNewBudget() {
    setClientId(null);
    setScreen("client");
  }

  function logout() {
    setLogged(false);
    setScreen("login");
    setCompany(null);
    setClientId(null);
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
      <header className="topbar">
        <div>
          <h1>OrçaFlow</h1>
          {company && <p>{company.name}</p>}
        </div>

        <button className="secondary" onClick={logout}>
          Sair
        </button>
      </header>

      {screen !== "setup" && (
        <nav>
          <button onClick={() => setScreen("home")}>Início</button>
          <button onClick={startNewBudget}>Novo orçamento</button>
          <button onClick={() => setScreen("setup")}>Dados da empresa</button>
        </nav>
      )}

      {screen === "home" && (
        <section>
          <h2>Bem-vindo{company ? `, ${company.name}` : ""}</h2>

          <p>
            Comece criando um novo orçamento para seu cliente. Depois de preencher os dados,
            o sistema gera um PDF pronto para enviar.
          </p>

          <button className="primary-action" onClick={startNewBudget}>
            + Novo orçamento
          </button>
        </section>
      )}

      {screen === "setup" && (
        <>
          <h2>Dados da Marcenaria</h2>

          <p>Preencha os dados que aparecerão no orçamento em PDF.</p>

          <form onSubmit={saveCompany}>
            <input name="name" placeholder="Nome da marcenaria" defaultValue={company?.name || ""} required />
            <input name="document" placeholder="CNPJ ou CPF" defaultValue={company?.document || ""} />
            <input name="phone" placeholder="Telefone" defaultValue={company?.phone || ""} />
            <input name="whatsapp" placeholder="WhatsApp" defaultValue={company?.whatsapp || ""} />
            <input name="email" placeholder="E-mail" defaultValue={company?.email || ""} />
            <input name="address" placeholder="Endereço" defaultValue={company?.address || ""} />
            <input name="responsible" placeholder="Responsável" defaultValue={company?.responsible || ""} />
            <input name="pix" placeholder="Chave Pix" defaultValue={company?.pix || ""} />
            <textarea
              name="default_notes"
              placeholder="Observações padrão"
              defaultValue={company?.default_notes || ""}
            />

            <button>Salvar e continuar</button>
          </form>
        </>
      )}

      {screen === "client" && (
        <>
          <h2>Dados do Cliente</h2>

          <p>Informe para quem será feito o orçamento.</p>

          <form onSubmit={saveClient}>
            <input name="name" placeholder="Nome do cliente" required />
            <input name="phone" placeholder="Telefone" />
            <input name="email" placeholder="E-mail" />
            <input name="address" placeholder="Endereço" />
            <button>Continuar para orçamento</button>
          </form>
        </>
      )}

      {screen === "budget" && (
        <>
          <h2>Criar Orçamento</h2>

          <form onSubmit={saveBudget}>
            <input name="title" placeholder="Título do orçamento" required />
            <input name="environment" placeholder="Ambiente: cozinha, quarto, sala..." />
            <textarea name="description" placeholder="Descrição do projeto" />

            <h3>Itens do orçamento</h3>

            <div className="item-box">
              <strong>Item 1</strong>
              <input name="item1_description" placeholder="Descrição do item" required />
              <input name="item1_quantity" placeholder="Quantidade" type="number" defaultValue="1" />
              <input name="item1_price" placeholder="Valor unitário" type="number" required />
            </div>

            <div className="item-box">
              <strong>Item 2</strong>
              <input name="item2_description" placeholder="Descrição do item" />
              <input name="item2_quantity" placeholder="Quantidade" type="number" />
              <input name="item2_price" placeholder="Valor unitário" type="number" />
            </div>

            <div className="item-box">
              <strong>Item 3</strong>
              <input name="item3_description" placeholder="Descrição do item" />
              <input name="item3_quantity" placeholder="Quantidade" type="number" />
              <input name="item3_price" placeholder="Valor unitário" type="number" />
            </div>

            <input name="discount" placeholder="Desconto" type="number" defaultValue="0" />
            <input name="extra_cost" placeholder="Acréscimo/Frete" type="number" defaultValue="0" />
            <input name="delivery_time" placeholder="Prazo de entrega" />
            <input name="payment_method" placeholder="Forma de pagamento" />
            <input name="validity" placeholder="Validade do orçamento" />
            <textarea name="notes" placeholder="Observações" />

            <button>Criar orçamento e gerar PDF</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;