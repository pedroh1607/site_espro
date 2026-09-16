const catalogo = document.querySelector(".catalogo");
const catalogoScreen = document.getElementById("screen-catalogo");
const homeScreen = document.getElementById("screen-home");
const loanTableBody = document.getElementById("loanTableBody");
const searchInput = document.getElementById("searchInput");
const form = document.getElementById("cadastroLivros");
const formMessage = document.getElementById("form-message");
const pessoaForm = document.getElementById("cadastroPessoas");
const pessoaFormMessage = document.getElementById("pessoa-form-message");
const loanForm = document.getElementById("cadastroEmprestimo");
const loanFormMessage = document.getElementById("loan-form-message");

let livros = [];
let usuarios = [];
let emprestimos = [];
const storageKey = "bookshare-database";

function saveData() {
    localStorage.setItem(storageKey, JSON.stringify({ livros, usuarios, emprestimos }));
}

function renderData() {
    renderLivros(livros);
    renderEmprestimos(emprestimos);
    renderLoanOptions();
}

function normalizeText(value) {
    return String(value ?? "").toLowerCase().trim();
}

function renderLivros(livrosData) {
    catalogo.innerHTML = "";

    livrosData.forEach(livro => {
        const card = document.createElement("div");
        card.className = "card";

        const foto = livro.Foto || "./assets/book.png";
        card.style.backgroundImage = `url(${foto})`;
        card.style.backgroundSize = "cover";
        card.style.backgroundPosition = "center";

        card.innerHTML = `
            <div class="container_card">
                <h3>${livro.Titulo || "Livro"}</h3>
                <p>Autor: ${livro.Autor || "Autor desconhecido"}</p>
                <p>Categoria: ${livro.Categoria || "Geral"}</p>
                <p>Status: ${livro.Disponivel ?? 0} / ${livro.Quantidade ?? 0}</p>
            </div>
        `;

        catalogo.appendChild(card);
    });
}

function renderEmprestimos(data) {
    if (!loanTableBody) {
        return;
    }

    loanTableBody.innerHTML = "";

    data.forEach(item => {
        const row = document.createElement("tr");
        const livro = livros.find(l => String(l.Id) === String(item.LivroId)) || { Titulo: "Livro" };
        const usuario = usuarios.find(u => String(u.Id) === String(item.UsuarioId)) || { Nome: "Leitor" };

        row.innerHTML = `
            <td>${livro.Titulo}</td>
            <td>${usuario.Nome}</td>
            <td>${item.DataSaida || "-"}</td>
            <td>${item.DataDevolucao || "-"}</td>
            <td><span class="loan-status">${item.Status || "Ativo"}</span></td>
        `;

        loanTableBody.appendChild(row);
    });
}

function showScreen(screenName) {
    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.toggle("active", item.dataset.screen === screenName);
    });

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.toggle("active", screen.id === `screen-${screenName}`);
    });
}

function initNavigation() {
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", () => showScreen(item.dataset.screen));
    });

    document.querySelector(".js-go-catalogo")?.addEventListener("click", () => showScreen("catalogo"));
    document.querySelector(".js-go-cadastrar")?.addEventListener("click", () => showScreen("cadastrar"));
}

function initSearch() {
    if (!searchInput) return;

    searchInput.addEventListener("input", (event) => {
        const termo = normalizeText(event.target.value);
        const resultados = livros.filter(livro => {
            return normalizeText(livro.Titulo).includes(termo)
                || normalizeText(livro.Autor).includes(termo)
                || normalizeText(livro.Categoria).includes(termo);
        });

        renderLivros(resultados);
    });
}

function initCadastro() {
    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const titulo = document.getElementById("tituloLivro").value.trim();
        const autor = document.getElementById("autorLivro").value.trim();
        const categoria = document.getElementById("categoriaLivro").value.trim();
        const foto = document.getElementById("fotoLivro").value.trim() || "./assets/book.png";
        const quantidade = Number(document.getElementById("quantidadeLivro").value || 1);
        const disponivel = Number(document.getElementById("disponivelLivro").value || 0);

        if (!titulo || !autor || !categoria) {
            formMessage.textContent = "Preencha título, autor e categoria.";
            return;
        }

        livros.push({
            Id: Date.now(),
            Titulo: titulo,
            Autor: autor,
            Categoria: categoria,
            Foto: foto,
            Quantidade: quantidade,
            Disponivel: disponivel
        });

        saveData();
        form.reset();
        renderLivros(livros);
        formMessage.textContent = "Livro cadastrado com sucesso.";
        showScreen("catalogo");
    });
}

function initCadastroPessoas() {
    if (!pessoaForm) return;

    pessoaForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const nome = document.getElementById("nomePessoa").value.trim();
        const email = document.getElementById("emailPessoa").value.trim();
        const telefone = document.getElementById("telefonePessoa").value.trim();
        const tipo = document.getElementById("tipoPessoa").value.trim();

        if (!nome || !email || !telefone || !tipo) {
            pessoaFormMessage.textContent = "Preencha nome, e-mail, telefone e tipo.";
            return;
        }

        usuarios.push({
            Id: Date.now(),
            Nome: nome,
            Email: email,
            Telefone: telefone,
            Tipo: tipo,
            Status: "Ativo"
        });

        saveData();
        pessoaForm.reset();
        pessoaFormMessage.textContent = "Pessoa cadastrada com sucesso.";
        renderLoanOptions();
        showScreen("pessoas");
    });
}

function renderLoanOptions() {
    const livroSelect = document.getElementById("livroEmprestimo");
    const pessoaSelect = document.getElementById("pessoaEmprestimo");

    if (livroSelect) {
        livroSelect.innerHTML = livros
            .map(livro => `<option value="${livro.Id ?? ''}">${livro.Titulo ?? 'Livro'}</option>`)
            .join('');
    }

    if (pessoaSelect) {
        pessoaSelect.innerHTML = usuarios
            .map(usuario => `<option value="${usuario.Id ?? ''}">${usuario.Nome ?? 'Pessoa'}</option>`)
            .join('');
    }
}

function initCadastroEmprestimo() {
    if (!loanForm) return;

    loanForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const livroId = document.getElementById("livroEmprestimo").value;
        const pessoaId = document.getElementById("pessoaEmprestimo").value;
        const dataSaida = document.getElementById("dataSaidaEmprestimo").value;
        const dataDevolucao = document.getElementById("dataDevolucaoEmprestimo").value;
        const status = document.getElementById("statusEmprestimo").value || "Ativo";

        if (!livroId || !pessoaId || !dataSaida) {
            loanFormMessage.textContent = "Selecione livro, pessoa e data de saída.";
            return;
        }

        emprestimos.push({
            LivroId: Number(livroId),
            UsuarioId: Number(pessoaId),
            DataSaida: dataSaida,
            DataDevolucao: dataDevolucao || "-",
            Status: status
        });

        saveData();
        loanForm.reset();
        renderEmprestimos(emprestimos);
        loanFormMessage.textContent = "Empréstimo cadastrado com sucesso.";
        showScreen("emprestimos");
    });
}

function loadDataFromJson() {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            livros = Array.isArray(data.livros) ? data.livros : [];
            usuarios = Array.isArray(data.usuarios) ? data.usuarios : [];
            emprestimos = Array.isArray(data.emprestimos) ? data.emprestimos : [];
            renderData();
            return;
        } catch (error) {
            localStorage.removeItem(storageKey);
            console.warn("Dados locais inválidos; carregando o XLSX convertido.", error);
        }
    }

    fetch("./json/banco_de_dados.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            livros = data.livros || [];
            usuarios = data.usuarios || [];
            emprestimos = data.emprestimos || [];

            renderData();
            saveData();
        })
        .catch(error => {
            console.error(error);
            catalogo.innerHTML = "<p class='empty-state'>Não foi possível carregar o catálogo.</p>";
        });
}

initNavigation();
initSearch();
initCadastro();
initCadastroPessoas();
initCadastroEmprestimo();
loadDataFromJson();

