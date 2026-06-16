import { useState } from "react";
import { api } from "./api";
import "./App.css";

function App() {
  const [logged, setLogged] = useState(false);
  const [screen, setScreen] = useState("login");
  const [company, setCompany] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [budgets, setBudgets] = useState([]);

  const [items, setItems] = useState([
    { description: "", quantity: 1, unit_price: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [extraCost, setExtraCost] = useState(0);

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

  async function loadBudgets() {
    const response = await api.get("/budgets");
    setBudgets(response.data);
    setScreen("budgets");
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  }

  function removeItem(index) {
    const updated = items.filter((_, itemIndex) => itemIndex !== index);
    setItems(
      updated.length
        ? updated
        : [{ description: "", quantity: 1, unit_price: 0 }]
    );
  }

  function updateItem(index, field, value) {
    const updated = [...items];

    updated[index][field] =
      field === "quantity" || field === "unit_price" ? Number(value) : value;

    setItems(updated);
  }

  function calculateSubtotal() {
    return items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
      0
    );
  }

  function calculateTotal() {
    return calculateSubtotal() - Number(discount || 0) + Number(extraCost || 0);
  }

  function formatMoney(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function saveBudget(e) {
    e.preventDefault();

    const form = new FormData(e.target);

    const validItems = items.filter(
      (item) => item.description && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Adicione pelo menos um item ao orçamento.");
      return;
    }

    const response = await api.post("/budgets", {
      client_id: clientId,
      title: form.get("title"),
      description: form.get("description"),
      environment: form.get("environment"),
      delivery_time: form.get("delivery_time"),
      payment_method: form.get("payment_method"),
      validity: form.get("validity"),
      notes: form.get("notes"),
      discount: Number(discount || 0),
      extra_cost: Number(extraCost || 0),
      items: validItems,
    });

    alert("Orçamento criado!");
    window.open(`http://localhost:8000/budgets/${response.data.id}/pdf`, "_blank");

    setItems([{ description: "", quantity: 1, unit_price: 0 }]);
    setDiscount(0);
    setExtraCost(0);
    setScreen("home");
  }

  function startNewBudget() {
    setClientId(null);
    setItems([{ description: "", quantity: 1, unit_price: 0 }]);
    setDiscount(0);
    setExtraCost(0);
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
          <input
            name="password"
            placeholder="Senha"
            type="password"
            defaultValue="admin123"
          />
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
          <button onClick={loadBudgets}>Orçamentos anteriores</button>
          <button onClick={() => setScreen("setup")}>Dados da empresa</button>
        </nav>
      )}

      {screen === "home" && (
        <section>
          <h2>Bem-vindo{company ? `, ${company.name}` : ""}</h2>

          <p>
            Comece criando um novo orçamento para seu cliente. Depois de
            preencher os dados, o sistema gera um PDF pronto para enviar.
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
            <input
              name="name"
              placeholder="Nome da marcenaria"
              defaultValue={company?.name || ""}
              required
            />
            <input
              name="document"
              placeholder="CNPJ ou CPF"
              defaultValue={company?.document || ""}
            />
            <input
              name="phone"
              placeholder="Telefone"
              defaultValue={company?.phone || ""}
            />
            <input
              name="whatsapp"
              placeholder="WhatsApp"
              defaultValue={company?.whatsapp || ""}
            />
            <input
              name="email"
              placeholder="E-mail"
              defaultValue={company?.email || ""}
            />
            <input
              name="address"
              placeholder="Endereço"
              defaultValue={company?.address || ""}
            />
            <input
              name="responsible"
              placeholder="Responsável"
              defaultValue={company?.responsible || ""}
            />
            <input
              name="pix"
              placeholder="Chave Pix"
              defaultValue={company?.pix || ""}
            />
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
          <h2>Dados do cliente</h2>

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
          <h2>Criar orçamento</h2>

          <form onSubmit={saveBudget}>
            <div className="form-section">
              <h3>Dados do projeto</h3>

              <div className="form-grid">
                <label className="form-label">
                  Título do orçamento
                  <input
                    name="title"
                    placeholder="Ex: Cozinha planejada"
                    required
                  />
                </label>

                <label className="form-label">
                  Ambiente
                  <input
                    name="environment"
                    placeholder="Ex: Cozinha, quarto, sala..."
                  />
                </label>

                <label className="form-label full">
                  Descrição do projeto
                  <textarea
                    name="description"
                    placeholder="Descreva o serviço, materiais, acabamento ou detalhes importantes."
                  />
                </label>
              </div>
            </div>

            <div className="form-section">
              <h3>Itens do orçamento</h3>

              {items.map((item, index) => (
                <div className="item-box" key={index}>
                  <div className="item-header">
                    <strong>Item {index + 1}</strong>

                    {items.length > 1 && (
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => removeItem(index)}
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="form-grid">
                    <label className="form-label full">
                      Descrição
                      <input
                        placeholder="Ex: Armário superior MDF branco"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        required
                      />
                    </label>

                    <label className="form-label">
                      Quantidade
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                      />
                    </label>

                    <label className="form-label">
                      Valor unitário
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, "unit_price", e.target.value)
                        }
                      />
                    </label>

                    <label className="form-label">
                      Subtotal
                      <input
                        value={formatMoney(item.quantity * item.unit_price)}
                        disabled
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button type="button" className="add-button" onClick={addItem}>
                + Adicionar item
              </button>
            </div>

            <div className="form-section">
              <h3>Condições comerciais</h3>

              <div className="form-grid">
                <label className="form-label">
                  Desconto
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </label>

                <label className="form-label">
                  Acréscimo / Frete
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={extraCost}
                    onChange={(e) => setExtraCost(Number(e.target.value))}
                  />
                </label>

                <label className="form-label">
                  Prazo de entrega
                  <input name="delivery_time" placeholder="Ex: 30 dias úteis" />
                </label>

                <label className="form-label">
                  Validade do orçamento
                  <input name="validity" placeholder="Ex: 15 dias" />
                </label>

                <label className="form-label full">
                  Forma de pagamento
                  <input
                    name="payment_method"
                    placeholder="Ex: 50% entrada e 50% na entrega"
                  />
                </label>

                <label className="form-label full">
                  Observações
                  <textarea
                    name="notes"
                    placeholder="Ex: Valores sujeitos à alteração após visita técnica."
                  />
                </label>
              </div>
            </div>

            <div className="summary-box">
              <div className="summary-line">
                <span>Subtotal</span>
                <strong>{formatMoney(calculateSubtotal())}</strong>
              </div>

              <div className="summary-line">
                <span>Desconto</span>
                <strong>- {formatMoney(discount)}</strong>
              </div>

              <div className="summary-line">
                <span>Acréscimo / Frete</span>
                <strong>+ {formatMoney(extraCost)}</strong>
              </div>

              <div className="summary-total">
                <span>Total final</span>
                <span>{formatMoney(calculateTotal())}</span>
              </div>
            </div>

            <button className="primary-action">
              Criar orçamento e gerar PDF
            </button>
          </form>
        </>
      )}

      {screen === "budgets" && (
        <>
          <h2>Orçamentos anteriores</h2>

          {budgets.length === 0 ? (
            <p>Nenhum orçamento criado ainda.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Cliente</th>
                    <th>Título</th>
                    <th>Ambiente</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>PDF</th>
                  </tr>
                </thead>

                <tbody>
                  {budgets.map((budget) => (
                    <tr key={budget.id}>
                      <td>#{budget.id}</td>
                      <td>{budget.client_name}</td>
                      <td>{budget.title}</td>
                      <td>{budget.environment || "-"}</td>
                      <td>{formatMoney(budget.total)}</td>
                      <td>{budget.status}</td>
                      <td>
                        <button
                          className="small-button"
                          onClick={() =>
                            window.open(
                              `http://localhost:8000/budgets/${budget.id}/pdf`,
                              "_blank"
                            )
                          }
                        >
                          Baixar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;