(() => {
    "use strict";

    const form = document.getElementById("applicationForm");
    if (!form) return;

    const $ = (id) => document.getElementById(id);
    const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function autoResize(textarea) {
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = Math.max(textarea.scrollHeight, 92) + "px";
    }

    qa("textarea").forEach(textarea => {
        textarea.addEventListener("input", () => autoResize(textarea));
        autoResize(textarea);
    });

    // ---------- Организации ----------
    function setOrg(prefix, type) {
        const full = $(`${prefix}_name`);
        const short = $(`${prefix}_short`);
        const ogrn = $(`${prefix}_ogrn`);
        const ogrnLabel = $(`${prefix}OgrnLabel`);
        if (!full || !short || !ogrn) return;

        if (type === "АО") {
            full.value = "Акционерное общество «___»";
            short.value = "АО «___»";
        } else if (type === "ООО") {
            full.value = "Общество с ограниченной ответственностью «___»";
            short.value = "ООО «___»";
        } else if (type === "ИП") {
            full.value = "Индивидуальный предприниматель ___";
            short.value = "ИП ___";
        }

        if (ogrnLabel) {
            const required = prefix === "customer" ? ' <span class="required-mark">*</span>' : "";
            ogrnLabel.innerHTML = (type === "ИП" ? "ОГРНИП" : "ОГРН") + required;
        }
        ogrn.placeholder = type === "ИП" ? "15 цифр" : "13 цифр";
        full.dispatchEvent(new Event("input", { bubbles: true }));
        short.dispatchEvent(new Event("input", { bubbles: true }));
        full.focus();
    }

    qa(".org-template-btn").forEach(btn => {
        btn.addEventListener("click", () => setOrg(btn.dataset.prefix, btn.dataset.orgType));
    });

    const sameManufacturer = $("same");
    const manufacturerToolbar = document.querySelector(".manufacturer-template-toolbar");
    const manufacturerPairs = [
        ["customer_name", "manufacturer_name"],
        ["customer_short", "manufacturer_short"],
        ["customer_ogrn", "manufacturer_ogrn"],
        ["customer_phone", "manufacturer_phone"],
        ["customer_address", "manufacturer_address"],
        ["customer_fact_address", "manufacturer_fact_address"],
        ["customer_email", "manufacturer_email"]
    ];

    function syncManufacturer() {
        if (!sameManufacturer) return;
        manufacturerPairs.forEach(([sourceId, targetId]) => {
            const source = $(sourceId);
            const target = $(targetId);
            if (!source || !target) return;
            if (sameManufacturer.checked) {
                target.value = source.value;
                target.readOnly = true;
                target.classList.add("locked");
                if (target.tagName === "TEXTAREA") autoResize(target);
            } else {
                target.readOnly = false;
                target.classList.remove("locked");
            }
        });
        if (manufacturerToolbar) {
            manufacturerToolbar.hidden = false;
            manufacturerToolbar.classList.toggle("is-disabled", sameManufacturer.checked);
            qa("button", manufacturerToolbar).forEach(button => { button.disabled = sameManufacturer.checked; });
        }
        if (sameManufacturer.checked) {
            const customerOgrn = $("customer_ogrn");
            const manufacturerOgrn = $("manufacturer_ogrn");
            const manufacturerOgrnLabel = $("manufacturerOgrnLabel");
            if (customerOgrn && manufacturerOgrn) manufacturerOgrn.placeholder = customerOgrn.placeholder;
            if (manufacturerOgrnLabel) manufacturerOgrnLabel.textContent = customerOgrn?.placeholder === "15 цифр" ? "ОГРНИП" : "ОГРН";
        }
    }

    sameManufacturer?.addEventListener("change", syncManufacturer);
    manufacturerPairs.forEach(([sourceId]) => {
        $(sourceId)?.addEventListener("input", () => {
            if (sameManufacturer?.checked) syncManufacturer();
        });
    });

    function setupSameAddress(checkId, sourceId, targetId) {
        const check = $(checkId);
        const source = $(sourceId);
        const target = $(targetId);
        if (!check || !source || !target) return;

        const sync = () => {
            if (check.checked) {
                target.value = source.value;
                target.readOnly = true;
                target.classList.add("locked");
                autoResize(target);
            } else if (!(sameManufacturer?.checked && targetId.startsWith("manufacturer_"))) {
                target.readOnly = false;
                target.classList.remove("locked");
            }
        };
        check.addEventListener("change", sync);
        source.addEventListener("input", () => { if (check.checked) sync(); });
        return sync;
    }

    const syncCustomerAddress = setupSameAddress("customerSameAddress", "customer_address", "customer_fact_address");
    const syncManufacturerAddress = setupSameAddress("manufacturerSameAddress", "manufacturer_address", "manufacturer_fact_address");

    // ---------- ГОСТы ----------
    const gostTexts = {
        ng: "ГОСТ 30244-94 «Материалы строительные. Методы испытаний на горючесть» (метод I);",
        g: "ГОСТ 30244-94 «Материалы строительные. Методы испытаний на горючесть» (метод II);",
        v: "ГОСТ 30402-96 «Материалы строительные. Метод испытания на воспламеняемость»;",
        d: "ГОСТ 12.1.044-2018 «Система стандартов безопасности труда. Пожаровзрывоопасность веществ и материалов. Номенклатура показателей и методы их определения» (п. 11);",
        t: "ГОСТ 12.1.044-2018 «Система стандартов безопасности труда. Пожаровзрывоопасность веществ и материалов. Номенклатура показателей и методы их определения» (п. 13);",
        rp: "ГОСТ Р 51032-97 «Материалы строительные. Метод испытания на распространение пламени»;",
        "30247_pair": "ГОСТ 30247.0-94 «Конструкции строительные. Методы испытаний на огнестойкость. Общие требования»;\nГОСТ 30247.1-94 «Конструкции строительные. Методы испытаний на огнестойкость. Несущие и ограждающие конструкции».",
        "30247_4": "ГОСТ 30247.4-2022 «Конструкции строительные. Методы испытаний на огнестойкость. Светопрозрачные ограждающие конструкции».",
        "53307": "ГОСТ Р 53307-2009 «Конструкции строительные. Противопожарные двери и ворота. Метод испытаний на огнестойкость».",
        "30403": "ГОСТ 30403 «Конструкции строительные. Метод испытания на пожарную опасность».",
        "33000": "ГОСТ 33000 «Стекло и изделия из него. Метод испытания на огнестойкость».",
        "53295": "ГОСТ Р 53295 «Средства огнезащиты для стальных конструкций. Общие требования. Метод определения огнезащитной эффективности».",
        "1363_2": "ГОСТ Р ЕН 1363-2-2014 «Конструкции строительные. Испытания на огнестойкость. Часть 2. Альтернативные и дополнительные методы».",
        "50810": "ГОСТ Р 50810-95 «Пожарная безопасность текстильных материалов. Ткани декоративные. Метод испытания на воспламеняемость и классификация».",
        "53292": "ГОСТ Р 53292-2009 «Огнезащитные составы и вещества для древесины и материалов на ее основе. Общие требования. Методы испытаний».",
        "53303": "ГОСТ Р 53303-2009 «Конструкции строительные. Противопожарные двери и ворота. Метод испытаний на дымогазопроницаемость».",
        "53316": "ГОСТ Р 53316-2021 «Электропроводки. Сохраняемость работоспособности в условиях пожара. Методы испытаний».",
        "53310": "ГОСТ Р 53310-2009 «Проходки кабельные, вводы герметичные и проходы шинопроводов. Требования пожарной безопасности. Методы испытаний на огнестойкость»."
    };

    const gostShortNames = {
        ng: "30244-I", g: "30244-II", v: "30402", d: "12.1.044 п.11", t: "12.1.044 п.13", rp: "51032",
        "30247_pair": "30247.0 + 30247.1", "30247_4": "30247.4", "53307": "53307", "30403": "30403",
        "33000": "33000", "53295": "53295", "1363_2": "ЕН 1363-2", "50810": "50810", "53292": "53292",
        "53303": "53303", "53316": "53316", "53310": "53310"
    };

    const gostPicker = $("gostPicker");
    const gostPickerToggle = $("gostPickerToggle");
    const gostPickerMenu = $("gostPickerMenu");
    const gostPickerCount = $("gostPickerCount");
    const gostClearBtn = $("gostClearBtn");
    const gostSearch = $("gostSearch");
    const gostEmpty = $("gostEmpty");
    const standardsTextarea = $("standards");
    const selectedGosts = $("selectedGosts");
    const gostCheckboxes = qa("[data-gost-key]");
    const gostOptions = qa(".gost-option");
    const categoryButtons = qa("[data-gost-category]");
    let activeGostCategory = "all";

    function normalizeLineBreaks(value) {
        return String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    function cleanTextBlock(value) {
        return normalizeLineBreaks(value)
            .split("\n").map(line => line.trimEnd()).join("\n")
            .replace(/\n{3,}/g, "\n\n").trim();
    }

    function removeManagedText(value, text) {
        const normalizedValue = normalizeLineBreaks(value);
        const normalizedText = normalizeLineBreaks(text);
        return cleanTextBlock(normalizedValue.split(normalizedText).join(""));
    }

    function appendUniqueText(textarea, text) {
        const current = textarea.value.trim();
        if (normalizeLineBreaks(current).includes(normalizeLineBreaks(text))) return;
        textarea.value = [current, text].filter(Boolean).join("\n");
        autoResize(textarea);
    }

    function updateGostCountAndChips() {
        const checked = gostCheckboxes.filter(cb => cb.checked);
        gostPickerCount.textContent = checked.length;
        gostPickerCount.classList.toggle("is-empty", checked.length === 0);
        selectedGosts.innerHTML = "";
        checked.forEach(cb => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "selected-gost-chip";
            chip.dataset.removeGost = cb.dataset.gostKey;
            chip.textContent = `ГОСТ ${gostShortNames[cb.dataset.gostKey]} ×`;
            selectedGosts.appendChild(chip);
        });
        selectedGosts.hidden = checked.length === 0;
    }

    function applyGostSelectionChange(checkbox) {
        const text = gostTexts[checkbox.dataset.gostKey];
        if (!text) return;
        if (checkbox.checked) appendUniqueText(standardsTextarea, text);
        else standardsTextarea.value = removeManagedText(standardsTextarea.value, text);
        autoResize(standardsTextarea);
        updateGostCountAndChips();
        renderIndicatorHelpers();
        standardsTextarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function restoreGostSelection() {
        const current = normalizeLineBreaks(standardsTextarea.value);
        gostCheckboxes.forEach(cb => {
            const text = normalizeLineBreaks(gostTexts[cb.dataset.gostKey]);
            cb.checked = Boolean(text && current.includes(text));
        });
        updateGostCountAndChips();
        renderIndicatorHelpers();
    }

    function setGostMenu(open) {
        gostPickerMenu.hidden = !open;
        gostPickerToggle.setAttribute("aria-expanded", String(open));
        gostPicker.classList.toggle("is-open", open);
        if (open) setTimeout(() => gostSearch?.focus(), 0);
    }

    function filterGosts() {
        const term = (gostSearch?.value || "").trim().toLowerCase();
        let visibleCount = 0;
        gostOptions.forEach(option => {
            const categories = (option.dataset.category || "").split(/\s+/);
            const categoryOk = activeGostCategory === "all" || categories.includes(activeGostCategory);
            const haystack = `${option.dataset.search || ""} ${option.textContent}`.toLowerCase();
            const searchOk = !term || haystack.includes(term);
            option.hidden = !(categoryOk && searchOk);
            if (!option.hidden) visibleCount++;
        });
        gostEmpty.hidden = visibleCount !== 0;
    }

    categoryButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            activeGostCategory = btn.dataset.gostCategory;
            categoryButtons.forEach(b => b.classList.toggle("is-active", b === btn));
            filterGosts();
            setGostMenu(true);
        });
    });

    gostSearch?.addEventListener("input", filterGosts);
    gostPickerToggle?.addEventListener("click", () => setGostMenu(gostPickerMenu.hidden));
    gostCheckboxes.forEach(cb => cb.addEventListener("change", () => applyGostSelectionChange(cb)));

    gostClearBtn?.addEventListener("click", () => {
        gostCheckboxes.forEach(cb => {
            if (cb.checked) standardsTextarea.value = removeManagedText(standardsTextarea.value, gostTexts[cb.dataset.gostKey]);
            cb.checked = false;
        });
        autoResize(standardsTextarea);
        updateGostCountAndChips();
        renderIndicatorHelpers();
        standardsTextarea.dispatchEvent(new Event("input", { bubbles: true }));
    });

    selectedGosts?.addEventListener("click", event => {
        const btn = event.target.closest("[data-remove-gost]");
        if (!btn) return;
        const cb = gostCheckboxes.find(x => x.dataset.gostKey === btn.dataset.removeGost);
        if (cb) {
            cb.checked = false;
            applyGostSelectionChange(cb);
        }
    });

    document.addEventListener("click", event => {
        if (gostPicker && !gostPicker.contains(event.target) && !event.target.closest("[data-gost-category]")) setGostMenu(false);
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !gostPickerMenu.hidden) setGostMenu(false);
    });

    // ---------- Помощник по показателям ----------
    const indicatorsTextarea = $("indicators");
    const indicatorHelperField = $("indicatorHelperField");
    const indicatorHelper = $("indicatorHelper");

    const FIRE_TIME_SERIES = ["15", "30", "45", "60", "90", "120", "150", "180", "240", "360"];
    const GLASS_TIME_SERIES = ["15", "20", "30", "45", "60", "90", "120", "180", "240", "360"];

    const selectOptions = values => values.map(value => Array.isArray(value) ? value : [value, value]);
    const timeOptions = values => values.map(value => [value, `${value} мин`]);

    const TRANSLUCENT_TIME_SERIES = ["15", "30", "45", "60", "90", "120", "180"];

    const indicatorDefinitions = {
        ng: {
            label: "ГОСТ 30244-94, метод I — негорючесть",
            note: "Для метода I в заявке обычно указывают результат НГ. Если требуется группа Г1–Г4, выберите ГОСТ 30244-94, метод II.",
            legacyField: "class",
            controls: [
                { field: "class", label: "Группа", options: [["НГ", "НГ — негорючие"]] }
            ],
            build: s => s.class === "НГ" ? "Группа горючести – НГ (негорючие);" : ""
        },
        g: {
            label: "ГОСТ 30244-94, метод II — группа горючести",
            note: "Выберите группу. В заявку попадёт и обозначение, и принятое наименование группы.",
            legacyField: "class",
            controls: [
                { field: "class", label: "Группа", options: [["Г1", "Г1 — слабогорючие"], ["Г2", "Г2 — умеренногорючие"], ["Г3", "Г3 — нормальногорючие"], ["Г4", "Г4 — сильногорючие"]] }
            ],
            build: s => {
                const names = { "Г1": "слабогорючие", "Г2": "умеренногорючие", "Г3": "нормальногорючие", "Г4": "сильногорючие" };
                return s.class && names[s.class] ? `Группа горючести – ${s.class} (${names[s.class]});` : "";
            }
        },
        v: {
            label: "ГОСТ 30402-96 — воспламеняемость",
            note: "В1 — трудновоспламеняемые, В2 — умеренновоспламеняемые, В3 — легковоспламеняемые.",
            legacyField: "class",
            controls: [
                { field: "class", label: "Группа", options: [["В1", "В1 — трудновоспламеняемые"], ["В2", "В2 — умеренновоспламеняемые"], ["В3", "В3 — легковоспламеняемые"]] }
            ],
            build: s => {
                const names = { "В1": "трудновоспламеняемые", "В2": "умеренновоспламеняемые", "В3": "легковоспламеняемые" };
                return s.class && names[s.class] ? `Группа воспламеняемости – ${s.class} (${names[s.class]});` : "";
            }
        },
        d: {
            label: "ГОСТ 12.1.044-2018, п. 11 — дымообразующая способность",
            note: "Д1–Д3 — это группы по дымообразующей способности. Сам коэффициент дымообразования является числовой величиной, поэтому в заявку подставляется именно группа.",
            legacyField: "class",
            controls: [
                { field: "class", label: "Группа", options: [["Д1", "Д1 — с малой дымообразующей способностью"], ["Д2", "Д2 — с умеренной дымообразующей способностью"], ["Д3", "Д3 — с высокой дымообразующей способностью"]] }
            ],
            build: s => {
                const names = { "Д1": "с малой дымообразующей способностью", "Д2": "с умеренной дымообразующей способностью", "Д3": "с высокой дымообразующей способностью" };
                return s.class && names[s.class] ? `Группа дымообразующей способности – ${s.class} (${names[s.class]});` : "";
            }
        },
        t: {
            label: "ГОСТ 12.1.044-2018, п. 13 — токсичность продуктов горения",
            note: "Т1–Т4 — группы по токсичности продуктов горения, определяемые по величине показателя токсичности.",
            legacyField: "class",
            controls: [
                { field: "class", label: "Группа", options: [["Т1", "Т1 — малоопасные"], ["Т2", "Т2 — умеренноопасные"], ["Т3", "Т3 — высокоопасные"], ["Т4", "Т4 — чрезвычайно опасные"]] }
            ],
            build: s => {
                const names = { "Т1": "малоопасные", "Т2": "умеренноопасные", "Т3": "высокоопасные", "Т4": "чрезвычайно опасные" };
                return s.class && names[s.class] ? `Группа токсичности продуктов горения – ${s.class} (${names[s.class]});` : "";
            }
        },
        rp: {
            label: "ГОСТ Р 51032-97 — распространение пламени по поверхности",
            note: "РП1 — нераспространяющие, РП2 — слабораспространяющие, РП3 — умереннораспространяющие, РП4 — сильнораспространяющие.",
            legacyField: "class",
            controls: [
                { field: "class", label: "Группа", options: [["РП1", "РП1 — нераспространяющие"], ["РП2", "РП2 — слабораспространяющие"], ["РП3", "РП3 — умереннораспространяющие"], ["РП4", "РП4 — сильнораспространяющие"]] }
            ],
            build: s => {
                const names = { "РП1": "нераспространяющие", "РП2": "слабораспространяющие", "РП3": "умереннораспространяющие", "РП4": "сильнораспространяющие" };
                return s.class && names[s.class] ? `Группа по распространению пламени по поверхности – ${s.class} (${names[s.class]});` : "";
            }
        },
        "30247_pair": {
            label: "ГОСТ 30247.0-94 // ГОСТ 30247.1-94 — огнестойкость конструкций",
            note: "R — несущая способность, E — целостность, I — теплоизолирующая способность. Для обычной заявки выберите один требуемый предел; редкие составные значения можно дописать вручную ниже.",
            controls: [
                { field: "criterion", label: "Предел", options: [["R", "R — несущая способность"], ["RE", "RE — несущая способность + целостность"], ["REI", "REI — несущая способность + целостность + теплоизоляция"], ["E", "E — целостность"], ["EI", "EI — целостность + теплоизоляция"]] },
                { field: "time", label: "Время", options: timeOptions(FIRE_TIME_SERIES) }
            ],
            build: s => s.criterion && s.time ? `Предел огнестойкости – ${s.criterion} ${s.time};` : ""
        },
        "30247_4": {
            label: "ГОСТ 30247.4-2022 — светопрозрачные конструкции",
            note: "Оставлены практические обозначения E, EI, EW и EIW. Временной ряд для этого метода: 15, 30, 45, 60, 90, 120 и 180 мин.",
            controls: [
                { field: "criterion", label: "Предел", options: [["E", "E — целостность"], ["EI", "EI — целостность + теплоизоляция"], ["EW", "EW — целостность + ограничение теплового излучения"], ["EIW", "EIW — целостность + теплоизоляция + тепловое излучение"]] },
                { field: "time", label: "Время", options: timeOptions(TRANSLUCENT_TIME_SERIES) }
            ],
            build: s => s.criterion && s.time ? `Предел огнестойкости – ${s.criterion} ${s.time};` : ""
        },
        "53307": {
            label: "ГОСТ Р 53307-2009 — противопожарные двери и ворота",
            note: "Для заказчика оставлены наиболее понятные варианты: E — целостность и EI — целостность + теплоизолирующая способность.",
            controls: [
                { field: "criterion", label: "Предел", options: [["E", "E — целостность"], ["EI", "EI — целостность + теплоизоляция"]] },
                { field: "time", label: "Время", options: timeOptions(FIRE_TIME_SERIES) }
            ],
            build: s => s.criterion && s.time ? `Предел огнестойкости – ${s.criterion} ${s.time};` : ""
        },
        "30403": {
            label: "ГОСТ 30403-2012 — пожарная опасность конструкций",
            note: "К0 — непожароопасные, К1 — малопожароопасные, К2 — умереннопожароопасные, К3 — пожароопасные. Число в скобках — время теплового воздействия.",
            legacyField: "class",
            controls: [
                { field: "class", label: "Класс", options: [["К0", "К0 — непожароопасные"], ["К1", "К1 — малопожароопасные"], ["К2", "К2 — умереннопожароопасные"], ["К3", "К3 — пожароопасные"]] },
                { field: "time", label: "Время воздействия", options: timeOptions(["15", "30", "45"]) }
            ],
            build: s => s.class && s.time ? `Класс пожарной опасности конструкции – ${s.class}(${s.time}).` : ""
        },
        "33000": {
            label: "ГОСТ 33000-2014 — огнестойкость стекла / стеклопакетов",
            note: "Сначала выберите положение образца. Для вертикального положения применяются E, EI, EW; критерии с R применяются только при горизонтальном положении. Составные обозначения через «/» при необходимости можно дописать вручную.",
            controls: [
                { field: "position", label: "Положение", rerenderOnChange: true, options: [["v", "v — вертикальное"], ["h", "h — горизонтальное"]] },
                { field: "criterion", label: "Предел", options: state => state.position === "h"
                    ? [["R", "R — несущая способность"], ["RE", "RE — R + E"], ["REI", "REI — R + E + I"], ["REW", "REW — R + E + W"], ["E", "E — целостность"], ["EI", "EI — E + I"], ["EW", "EW — E + W"]]
                    : [["E", "E — целостность"], ["EI", "EI — E + I"], ["EW", "EW — E + W"]] },
                { field: "time", label: "Время", options: timeOptions(GLASS_TIME_SERIES) }
            ],
            validate: s => {
                if (s.position === "v" && (s.criterion || "").startsWith("R")) return "Критерии R, RE, REI и REW применяются только при горизонтальном положении (h).";
                return "";
            },
            build: s => {
                if (!s.position || !s.criterion || !s.time) return "";
                if (s.position === "v" && s.criterion.startsWith("R")) return "";
                return `Предел огнестойкости стекла – ${s.criterion} ${s.time} (${s.position});`;
            }
        },
        "53295": {
            label: "ГОСТ Р 53295-2009 — огнезащита стальных конструкций",
            note: "Семь групп огнезащитной эффективности: от 1-й (не менее 150 мин) до 7-й (не менее 15 мин).",
            controls: [
                { field: "group", label: "Группа", options: [["1", "1-я — не менее 150 мин"], ["2", "2-я — не менее 120 мин"], ["3", "3-я — не менее 90 мин"], ["4", "4-я — не менее 60 мин"], ["5", "5-я — не менее 45 мин"], ["6", "6-я — не менее 30 мин"], ["7", "7-я — не менее 15 мин"]] }
            ],
            build: s => {
                const times = { "1": "150", "2": "120", "3": "90", "4": "60", "5": "45", "6": "30", "7": "15" };
                return s.group ? `${s.group}-я группа огнезащитной эффективности (не менее ${times[s.group]} мин);` : "";
            }
        },
        "1363_2": {
            label: "ГОСТ Р ЕН 1363-2-2014 — альтернативный температурный режим",
            note: "В вашем списке этот ГОСТ выбран именно для испытаний при углеводородном температурном режиме. Это условие испытания, а не отдельный класс огнестойкости.",
            controls: [
                { field: "regime", label: "Режим", options: [["hydrocarbon", "Углеводородный температурный режим"]] }
            ],
            build: s => s.regime === "hydrocarbon" ? "Температурный режим испытания – углеводородный;" : ""
        },
        "50810": {
            label: "ГОСТ Р 50810-95 — декоративные ткани",
            note: "По результатам испытаний горючие декоративные текстильные материалы подразделяются на трудновоспламеняемые и легковоспламеняемые.",
            controls: [
                { field: "class", label: "Классификация", options: [["hard", "Трудновоспламеняемые"], ["easy", "Легковоспламеняемые"]] }
            ],
            build: s => s.class === "hard"
                ? "Группа по воспламеняемости текстильного материала – трудновоспламеняемые;"
                : s.class === "easy" ? "Группа по воспламеняемости текстильного материала – легковоспламеняемые;" : ""
        },
        "53292": {
            label: "ГОСТ Р 53292-2009 — огнезащита древесины",
            note: "В сертификатах указывают I или II группу огнезащитной эффективности. I группа соответствует потере массы не более 9%, II — более 9%, но не более 25%.",
            controls: [
                { field: "group", label: "Группа", options: [["I", "I группа — потеря массы ≤ 9%"], ["II", "II группа — потеря массы > 9% и ≤ 25%"]] }
            ],
            build: s => s.group === "I" || s.group === "II" ? `${s.group} группа огнезащитной эффективности;` : ""
        },
        "53303": {
            label: "ГОСТ Р 53303-2009 — дымогазопроницаемость дверей и ворот",
            note: "Стандарт прямо устанавливает три обозначения по потере дымогазонепроницаемости: S15, S30 и S60.",
            controls: [
                { field: "class", label: "Предел", options: selectOptions(["S15", "S30", "S60"]) }
            ],
            build: s => s.class ? `Предел дымогазонепроницаемости – ${s.class};` : ""
        },
        "53316": {
            label: "ГОСТ Р 53316-2021 — работоспособность электропроводки (ОКЛ)",
            note: "Результат указывают временем сохранения работоспособности. Фиксированного ряда значений ГОСТ не устанавливает.",
            controls: [
                { field: "time", label: "Время, мин", type: "number", min: 1, step: 1, placeholder: "Например, 90" }
            ],
            validate: s => {
                if (!s.time) return "";
                const n = Number(s.time);
                return Number.isInteger(n) && n >= 1 ? "" : "Укажите положительное целое число минут.";
            },
            build: s => {
                const n = Number(s.time);
                return s.time && Number.isInteger(n) && n >= 1 ? `Время сохранения работоспособности электропроводки – ${n} мин;` : "";
            }
        },
        "53310": {
            label: "ГОСТ Р 53310-2009 — кабельные проходки",
            note: "Для кабельной проходки стандарт использует обозначение IET и нормированный ряд времени 15–360 мин.",
            controls: [
                { field: "time", label: "Время", options: timeOptions(FIRE_TIME_SERIES) }
            ],
            build: s => s.time ? `Предел огнестойкости кабельной проходки – IET${s.time};` : ""
        }
    };

    const managedIndicatorTexts = {};
    const indicatorValuesState = {};

    function emptyIndicatorState(key) {
        const state = {};
        (indicatorDefinitions[key]?.controls || []).forEach(control => { state[control.field] = ""; });
        return state;
    }

    function inferIndicatorValues(key, text) {
        const value = String(text || "");
        let m;
        if (key === "ng") {
            if (/Группа горючести\s*[–-]\s*НГ|Горючесть материала\s*[–-]\s*НГ|Материал относится к негорючим по ГОСТ 30244-94/i.test(value)) return { class: "НГ" };
        }
        if (key === "g" && (m = value.match(/Группа горючести\s*[–-]\s*(Г[1-4])/i))) return { class: m[1].toUpperCase() };
        if (key === "v" && (m = value.match(/Группа (?:по )?воспламеняемости\s*[–-]\s*(В[1-3])/i))) return { class: m[1].toUpperCase() };
        if (key === "d" && (m = value.match(/Группа (?:по )?(?:дымобразующей|дымообразующей) способности\s*[–-]\s*(Д[1-3])/i))) return { class: m[1].toUpperCase() };
        if (key === "d" && (m = value.match(/Группа дымообразования\s*[–-]\s*(Д[1-3])/i))) return { class: m[1].toUpperCase() };
        if (key === "t" && (m = value.match(/Группа (?:по )?токсичности(?: продуктов горения)?\s*[–-]\s*(Т[1-4])/i))) return { class: m[1].toUpperCase() };
        if (key === "rp" && (m = value.match(/Группа (?:по )?распространени[яю] пламени(?: по поверхности)?\s*[–-]\s*(РП[1-4])/i))) return { class: m[1].toUpperCase() };
        if (key === "30247_pair" && (m = value.match(/Предел огнестойкости\s*[–-]\s*(REI|RE|EI|R|E)\s*(\d+)/i))) return { criterion: m[1].toUpperCase(), time: m[2] };
        if (key === "30247_4" && (m = value.match(/Предел огнестойкости\s*[–-]\s*(EIW|EW|EI|E)\s*(\d+)/i))) return { criterion: m[1].toUpperCase(), time: m[2] };
        if (key === "53307" && (m = value.match(/Предел огнестойкости\s*[–-]\s*(EI|E)\s*(\d+)/i))) return { criterion: m[1].toUpperCase(), time: m[2] };
        if (key === "30403" && (m = value.match(/Класс пожарной опасности конструкции\s*[–-]\s*(К[0-3])\s*\((15|30|45)\)/i))) return { class: m[1].toUpperCase(), time: m[2] };
        if (key === "33000" && (m = value.match(/Предел огнестойкости стекла\s*[–-]\s*(REI|REW|RE|EI|EW|R|E)\s*(\d+)(?:\s*\/[^\(]+)?\s*\(([hv])\)/i))) return { criterion: m[1].toUpperCase(), time: m[2], position: m[3].toLowerCase() };
        if (key === "53295" && (m = value.match(/([1-7])-я группа огнезащитной эффективности/i))) return { group: m[1] };
        if (key === "53295" && (m = value.match(/Группа огнезащитной эффективности\s*[–-]\s*([1-7])-я/i))) return { group: m[1] };
        if (key === "1363_2" && /углеводородн/i.test(value)) return { regime: "hydrocarbon" };
        if (key === "50810") {
            if (/трудновоспламеняем/i.test(value)) return { class: "hard" };
            if (/легковоспламеняем/i.test(value)) return { class: "easy" };
        }
        if (key === "53292") {
            if ((m = value.match(/\b(I{1,2})\s+группа огнезащитной эффективности/i))) return { group: m[1].toUpperCase() };
            if ((m = value.match(/Группа огнезащитной эффективности\s*[–-]\s*(I{1,2})/i))) return { group: m[1].toUpperCase() };
        }
        if (key === "53303" && (m = value.match(/Предел дымогазонепроницаемости\s*[–-]\s*(S(?:15|30|60))/i))) return { class: m[1].toUpperCase() };
        if (key === "53316" && (m = value.match(/Время сохранения работоспособности(?: электропроводки)?\s*[–-]\s*(\d+)\s*мин/i))) return { time: m[1] };
        if (key === "53310" && (m = value.match(/Предел огнестойкости кабельной проходки\s*[–-]\s*IET\s*(\d+)/i))) return { time: m[1] };
        return emptyIndicatorState(key);
    }

    function indicatorValidationMessage(key, state) {
        const def = indicatorDefinitions[key];
        if (!def) return "";
        const required = (def.controls || []).filter(control => !control.optional);
        const hasSomething = (def.controls || []).some(control => String(state?.[control.field] || "").trim());
        if (!hasSomething) return "";
        const missing = required.find(control => !String(state?.[control.field] || "").trim());
        if (missing) return `Заполните поле «${missing.label}».`;
        return def.validate?.(state) || "";
    }

    function indicatorIsComplete(key, state) {
        const def = indicatorDefinitions[key];
        if (!def) return true;
        const required = (def.controls || []).filter(control => !control.optional);
        if (required.some(control => !String(state?.[control.field] || "").trim())) return false;
        if (def.validate?.(state)) return false;
        return Boolean(def.build(state));
    }

    const legacyIndicatorLinePatterns = {
        ng: /^Материал относится к (?:не)?горючим по ГОСТ 30244-94/i,
        g: /^Группа горючести.*по ГОСТ 30244-94/i,
        v: /^Группа воспламеняемости.*по ГОСТ 30402-96/i,
        d: /^Группа дымообразования.*по ГОСТ 12\.1\.044-2018/i,
        t: /^Группа токсичности.*по ГОСТ 12\.1\.044-2018/i,
        rp: /^Группа распространения пламени.*по ГОСТ Р 51032-97/i,
        "30247_pair": /^Предел огнестойкости.*по ГОСТ 30247\.0-94/i,
        "30247_4": /^Предел огнестойкости.*по ГОСТ 30247\.4-2022/i,
        "53307": /^Предел огнестойкости.*по ГОСТ Р 53307-2009/i,
        "30403": /^Класс пожарной опасности конструкции.*по ГОСТ 30403/i,
        "33000": /^Предел огнестойкости стекла.*по ГОСТ 33000/i,
        "53295": /^Группа огнезащитной эффективности.*по ГОСТ Р 53295/i,
        "1363_2": /^Температурный режим испытан.*по ГОСТ Р ЕН 1363-2-2014/i,
        "50810": /^Материал относится к .*по ГОСТ Р 50810-95/i,
        "53292": /^(?:Группа огнезащитной эффективности|Огнезащитная эффективность).*по ГОСТ Р 53292-2009/i,
        "53303": /^Предел дымогазонепроницаемости.*по ГОСТ Р 53303-2009/i,
        "53316": /^Время сохранения работоспособности.*по ГОСТ Р 53316-2021/i,
        "53310": /^Предел огнестойкости кабельной проходки.*по ГОСТ Р 53310-2009/i
    };

    function removeLegacyGeneratedIndicatorLine(key) {
        const pattern = legacyIndicatorLinePatterns[key];
        if (!pattern || !indicatorsTextarea?.value) return;
        const lines = normalizeLineBreaks(indicatorsTextarea.value).split("\n");
        const filtered = lines.filter(line => !pattern.test(line.trim()));
        if (filtered.length !== lines.length) indicatorsTextarea.value = cleanTextBlock(filtered.join("\n"));
    }

    function removePreviousIndicator(key) {
        const previous = managedIndicatorTexts[key];
        if (previous) indicatorsTextarea.value = removeManagedText(indicatorsTextarea.value, previous);
        managedIndicatorTexts[key] = "";
    }

    function setIndicatorValue(key) {
        const def = indicatorDefinitions[key];
        const state = indicatorValuesState[key] || emptyIndicatorState(key);
        removeLegacyGeneratedIndicatorLine(key);
        removePreviousIndicator(key);
        const validationMessage = indicatorValidationMessage(key, state);
        const text = validationMessage ? "" : def.build(state);
        if (text) {
            managedIndicatorTexts[key] = text;
            appendUniqueText(indicatorsTextarea, text);
        }
        autoResize(indicatorsTextarea);
        indicatorsTextarea.dispatchEvent(new Event("input", { bubbles: true }));
        return { text, validationMessage };
    }

    function controlOptions(control, state) {
        const options = typeof control.options === "function" ? control.options(state || {}) : (control.options || []);
        return options.map(item => Array.isArray(item) ? item : [item, item]);
    }

    function buildIndicatorControl(key, control, state) {
        const wrap = document.createElement("div");
        wrap.className = "indicator-control";

        const label = document.createElement("label");
        const controlId = `indicator_${key}_${control.field}`;
        label.htmlFor = controlId;
        label.textContent = control.label + (control.optional ? " (необязательно)" : "");
        wrap.appendChild(label);

        let input;
        if (control.type === "number") {
            input = document.createElement("input");
            input.type = "number";
            if (control.min != null) input.min = String(control.min);
            if (control.max != null) input.max = String(control.max);
            if (control.step != null) input.step = String(control.step);
            input.placeholder = control.placeholder || "";
            if (control.datalist?.length) {
                const listId = `${controlId}_list`;
                input.setAttribute("list", listId);
                const datalist = document.createElement("datalist");
                datalist.id = listId;
                control.datalist.forEach(value => {
                    const option = document.createElement("option");
                    option.value = String(value);
                    datalist.appendChild(option);
                });
                wrap.appendChild(datalist);
            }
        } else {
            input = document.createElement("select");
            const blank = document.createElement("option");
            blank.value = "";
            blank.textContent = control.placeholder || "Не выбрано";
            input.appendChild(blank);
            controlOptions(control, state).forEach(([value, title]) => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = title;
                input.appendChild(option);
            });
        }

        input.id = controlId;
        input.dataset.indicatorKey = key;
        input.dataset.indicatorField = control.field;
        input.value = state[control.field] || "";
        const eventName = control.type === "number" ? "input" : "change";
        input.addEventListener(eventName, () => {
            indicatorValuesState[key][control.field] = input.value;
            if (control.rerenderOnChange) {
                if (key === "33000" && control.field === "position" && input.value === "v" && String(indicatorValuesState[key].criterion || "").startsWith("R")) {
                    indicatorValuesState[key].criterion = "";
                }
                setIndicatorValue(key);
                renderIndicatorHelpers();
                return;
            }
            const result = setIndicatorValue(key);
            updateIndicatorPreview(key, wrap.closest(".indicator-helper-row"), result);
        });
        wrap.insertBefore(input, wrap.querySelector("datalist") || null);
        return wrap;
    }

    function updateIndicatorPreview(key, row, result = null) {
        if (!row) return;
        const state = indicatorValuesState[key] || emptyIndicatorState(key);
        const preview = row.querySelector(".indicator-preview");
        if (!preview) return;
        const validationMessage = result?.validationMessage ?? indicatorValidationMessage(key, state);
        const text = result?.text ?? (validationMessage ? "" : indicatorDefinitions[key].build(state));
        preview.classList.toggle("has-error", Boolean(validationMessage));
        preview.classList.toggle("has-value", Boolean(text));
        if (validationMessage) preview.textContent = validationMessage;
        else if (text) preview.textContent = `Будет добавлено: ${text}`;
        else preview.textContent = "Выберите значения — готовая строка автоматически появится в поле «Заявляемые показатели».";
    }

    function renderIndicatorHelpers() {
        if (!indicatorHelper || !indicatorHelperField) return;
        const selectedKeys = gostCheckboxes.filter(cb => cb.checked).map(cb => cb.dataset.gostKey);
        const helperKeys = selectedKeys.filter(key => indicatorDefinitions[key]);

        Object.keys(indicatorDefinitions).forEach(key => {
            if (!helperKeys.includes(key)) {
                if (managedIndicatorTexts[key]) removePreviousIndicator(key);
                delete indicatorValuesState[key];
            }
        });

        indicatorHelper.innerHTML = "";
        helperKeys.forEach(key => {
            const def = indicatorDefinitions[key];
            if (!indicatorValuesState[key]) indicatorValuesState[key] = inferIndicatorValues(key, indicatorsTextarea.value);
            const state = indicatorValuesState[key];

            // Если строка уже была сформирована до перерисовки, считаем её управляемой.
            const existingText = def.build(state);
            if (existingText && normalizeLineBreaks(indicatorsTextarea.value).includes(normalizeLineBreaks(existingText))) {
                managedIndicatorTexts[key] = existingText;
            }

            const row = document.createElement("div");
            row.className = "indicator-helper-row";
            row.dataset.indicatorRow = key;

            const head = document.createElement("div");
            head.className = "indicator-helper-head";
            const title = document.createElement("strong");
            title.textContent = def.label;
            head.appendChild(title);
            if (def.note) {
                const note = document.createElement("span");
                note.textContent = def.note;
                head.appendChild(note);
            }
            row.appendChild(head);

            const controls = document.createElement("div");
            controls.className = "indicator-controls";
            def.controls.forEach(control => controls.appendChild(buildIndicatorControl(key, control, state)));
            row.appendChild(controls);

            const preview = document.createElement("div");
            preview.className = "indicator-preview";
            row.appendChild(preview);
            indicatorHelper.appendChild(row);
            updateIndicatorPreview(key, row);
        });
        indicatorHelperField.hidden = helperKeys.length === 0;
        autoResize(indicatorsTextarea);
    }

    function normalizeDraftIndicatorValues(rawValues) {
        const normalized = {};
        Object.entries(rawValues || {}).forEach(([key, raw]) => {
            const def = indicatorDefinitions[key];
            if (!def) return;
            if (raw && typeof raw === "object" && !Array.isArray(raw)) {
                normalized[key] = { ...emptyIndicatorState(key), ...raw };
            } else if (typeof raw === "string" && def.legacyField) {
                normalized[key] = { ...emptyIndicatorState(key), [def.legacyField]: raw };
            }
        });
        return normalized;
    }

    // ---------- Валидация и прогресс ----------
    const requiredRules = [
        { id: "customer_name", label: "Полное наименование заявителя", type: "field" },
        { id: "customer_ogrn", label: "ОГРН / ОГРНИП заявителя", type: "field" },
        { id: "dssoi", label: "Вид процедуры", type: "radio", group: "procedureGroup" },
        { id: "product_name", label: "Наименование продукции", type: "field" },
        { id: "batch_type", label: "Тип выпуска продукции", type: "radio", group: "batchTypeGroup" }
    ];

    function hasRequiredValue(rule) {
        if (rule.type === "radio") return Boolean(form.querySelector(`input[name="${rule.id}"]:checked`));
        return Boolean($(rule.id)?.value.trim());
    }

    function clearValidation() {
        qa(".error-field").forEach(el => el.classList.remove("error-field"));
        qa(".error-group").forEach(el => el.classList.remove("error-group"));
        qa(".field-error").forEach(el => { el.textContent = ""; });
    }

    function validateForm({ scroll = true } = {}) {
        clearValidation();
        const errors = [];
        requiredRules.forEach(rule => {
            if (hasRequiredValue(rule)) return;
            errors.push(rule);
            const message = `Заполните: ${rule.label}`;
            const errorEl = document.querySelector(`[data-error-for="${rule.id}"]`);
            if (errorEl) errorEl.textContent = message;
            if (rule.type === "radio") $(rule.group)?.classList.add("error-group");
            else $(rule.id)?.classList.add("error-field");
        });
        if (errors.length && scroll) {
            const first = errors[0];
            const el = first.type === "radio" ? $(first.group) : $(first.id);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            if (first.type !== "radio") setTimeout(() => $(first.id)?.focus(), 350);
        }
        return errors;
    }

    function updateProgress() {
        const filled = requiredRules.filter(hasRequiredValue).length;
        const total = requiredRules.length;
        const percent = Math.round((filled / total) * 100);
        $("progressText").textContent = `Обязательные поля: ${filled} из ${total}`;
        $("progressPercent").textContent = `${percent}%`;
        $("progressFill").style.width = `${percent}%`;
        $("progressBox").classList.toggle("is-complete", filled === total);
    }

    qa("input, textarea", form).forEach(control => {
        control.addEventListener("input", updateProgress);
        control.addEventListener("change", updateProgress);
        control.addEventListener("input", () => {
            if (control.id) {
                control.classList.remove("error-field");
                const errorEl = document.querySelector(`[data-error-for="${control.id}"]`);
                if (errorEl) errorEl.textContent = "";
            }
        });
    });
    qa('input[name="dssoi"], input[name="batch_type"]', form).forEach(radio => {
        radio.addEventListener("change", () => {
            const groupId = radio.name === "dssoi" ? "procedureGroup" : "batchTypeGroup";
            $(groupId)?.classList.remove("error-group");
            const errorEl = document.querySelector(`[data-error-for="${radio.name}"]`);
            if (errorEl) errorEl.textContent = "";
        });
    });

    // ---------- Локальный файл черновика ----------
    function getFormValues() {
        const values = {};
        const names = new Set(qa("[name]", form).map(el => el.name).filter(Boolean));
        names.forEach(name => {
            const controls = qa(`[name="${CSS.escape(name)}"]`, form);
            const first = controls[0];
            if (!first) return;
            if (first.type === "radio") {
                values[name] = controls.find(c => c.checked)?.value || "";
            } else if (first.type === "checkbox") {
                values[name] = controls.filter(c => c.checked).map(c => c.value);
            } else {
                values[name] = first.value;
            }
        });
        return values;
    }

    function collectDraft() {
        return {
            format: "ZayavkaServiceDraft",
            version: 4,
            saved_at: new Date().toISOString(),
            fields: getFormValues(),
            ui: {
                same_manufacturer: Boolean(sameManufacturer?.checked),
                customer_same_address: Boolean($("customerSameAddress")?.checked),
                manufacturer_same_address: Boolean($("manufacturerSameAddress")?.checked),
                gost_keys: gostCheckboxes.filter(cb => cb.checked).map(cb => cb.dataset.gostKey),
                indicator_values: JSON.parse(JSON.stringify(indicatorValuesState))
            }
        };
    }

    function downloadDraft() {
        const draft = collectDraft();
        const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `Заявка_черновик_${date}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showToast("Черновик сохранён файлом на вашем компьютере");
    }

    function populateField(name, value) {
        const controls = qa(`[name="${CSS.escape(name)}"]`, form);
        if (!controls.length) return;
        if (controls[0].type === "radio") {
            controls.forEach(c => { c.checked = c.value === value; });
        } else if (controls[0].type === "checkbox") {
            const values = Array.isArray(value) ? value : [];
            controls.forEach(c => { c.checked = values.includes(c.value); });
        } else {
            controls[0].value = value == null ? "" : String(value);
            if (controls[0].tagName === "TEXTAREA") autoResize(controls[0]);
        }
    }

    function applyDraft(draft) {
        if (!draft || draft.format !== "ZayavkaServiceDraft" || typeof draft.fields !== "object") {
            throw new Error("Файл не является черновиком этой формы.");
        }
        Object.entries(draft.fields).forEach(([name, value]) => populateField(name, value));

        const ui = draft.ui || {};
        if ($("customerSameAddress")) $("customerSameAddress").checked = Boolean(ui.customer_same_address);
        if ($("manufacturerSameAddress")) $("manufacturerSameAddress").checked = Boolean(ui.manufacturer_same_address);
        if (sameManufacturer) sameManufacturer.checked = Boolean(ui.same_manufacturer);

        Object.keys(indicatorValuesState).forEach(key => delete indicatorValuesState[key]);
        Object.assign(indicatorValuesState, normalizeDraftIndicatorValues(ui.indicator_values || {}));
        restoreGostSelection();
        if (Array.isArray(ui.gost_keys) && ui.gost_keys.length) {
            gostCheckboxes.forEach(cb => { cb.checked = ui.gost_keys.includes(cb.dataset.gostKey); });
            updateGostCountAndChips();
            renderIndicatorHelpers();
        }

        syncCustomerAddress?.();
        syncManufacturerAddress?.();
        syncManufacturer();
        qa("textarea").forEach(autoResize);
        updateProgress();
        clearValidation();
        showToast("Черновик загружен");
    }

    $("saveDraftBtn")?.addEventListener("click", downloadDraft);
    $("loadDraftBtn")?.addEventListener("click", () => $("draftFileInput")?.click());
    $("draftFileInput")?.addEventListener("change", event => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try { applyDraft(JSON.parse(reader.result)); }
            catch (error) { alert(`Не удалось загрузить черновик.\n\n${error.message}`); }
            event.target.value = "";
        };
        reader.onerror = () => alert("Не удалось прочитать файл черновика.");
        reader.readAsText(file, "UTF-8");
    });

    $("clearFormBtn")?.addEventListener("click", () => {
        if (!confirm("Очистить все заполненные поля заявки?")) return;
        form.reset();
        qa('input[type="text"], input:not([type]), input[type="search"], textarea', form).forEach(control => { control.value = ""; });
        qa('input[type="radio"], input[type="checkbox"]', form).forEach(control => { control.checked = false; });
        sameManufacturer.checked = false;
        if ($("customerSameAddress")) $("customerSameAddress").checked = false;
        if ($("manufacturerSameAddress")) $("manufacturerSameAddress").checked = false;
        Object.keys(managedIndicatorTexts).forEach(key => { managedIndicatorTexts[key] = ""; });
        Object.keys(indicatorValuesState).forEach(key => { delete indicatorValuesState[key]; });
        gostCheckboxes.forEach(cb => { cb.checked = false; });
        standardsTextarea.value = "";
        indicatorsTextarea.value = "";
        activeGostCategory = "all";
        categoryButtons.forEach(btn => btn.classList.toggle("is-active", btn.dataset.gostCategory === "all"));
        if (gostSearch) gostSearch.value = "";
        filterGosts();
        updateGostCountAndChips();
        renderIndicatorHelpers();
        syncManufacturer();
        qa("textarea").forEach(autoResize);
        clearValidation();
        updateProgress();
        showToast("Форма очищена");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ---------- Проверка перед Word ----------
    const reviewModal = $("reviewModal");
    const reviewContent = $("reviewContent");
    const reviewWarnings = $("reviewWarnings");

    function valueOf(name) {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        if (checked) return checked.value;
        const el = form.querySelector(`[name="${name}"]`);
        return el?.value?.trim() || "";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    function reviewItem(title, value) {
        const safe = escapeHtml(value || "—").replaceAll("\n", "<br>");
        return `<div class="review-item"><span>${escapeHtml(title)}</span><strong>${safe}</strong></div>`;
    }

    function buildWarnings() {
        const warnings = [];
        if (!valueOf("manufacturer_name")) warnings.push("Не указано полное наименование изготовителя.");
        if (!valueOf("standards")) warnings.push("Поле «Соответствует требованиям» не заполнено.");
        if (!valueOf("indicators")) warnings.push("Заявляемые показатели не указаны.");
        if (!valueOf("okpd2")) warnings.push("Код ОКПД2 не указан.");
        if (!valueOf("tnved")) warnings.push("Код ТН ВЭД не указан.");
        if (!valueOf("production_document")) warnings.push("Поле «Выпускается по» не заполнено.");
        if (/[?？]/.test(`${valueOf("standards")} ${valueOf("indicators")}`)) warnings.push("В требованиях или показателях обнаружен знак «?». Проверьте, не осталось ли незаполненного значения.");

        const selectedIndicatorKeys = gostCheckboxes.filter(cb => cb.checked && indicatorDefinitions[cb.dataset.gostKey]).map(cb => cb.dataset.gostKey);
        selectedIndicatorKeys.forEach(key => {
            const state = indicatorValuesState[key] || emptyIndicatorState(key);
            if (!indicatorIsComplete(key, state)) {
                const validationMessage = indicatorValidationMessage(key, state);
                warnings.push(validationMessage
                    ? `${indicatorDefinitions[key].label}: ${validationMessage}`
                    : `Для «${indicatorDefinitions[key].label}» показатель заполнен не полностью.`);
            }
        });
        return warnings;
    }

    function showReview() {
        const applicant = [valueOf("customer_name"), valueOf("customer_short")].filter(Boolean).join(" / ");
        const manufacturer = valueOf("manufacturer_name") || (sameManufacturer.checked ? "Совпадает с заявителем" : "—");
        reviewContent.innerHTML = [
            reviewItem("Заявитель", applicant),
            reviewItem("ОГРН / ОГРНИП", valueOf("customer_ogrn")),
            reviewItem("Изготовитель", manufacturer),
            reviewItem("Процедура", valueOf("dssoi")),
            reviewItem("Продукция", valueOf("product_name")),
            reviewItem("Тип выпуска", valueOf("batch_type")),
            reviewItem("ОКПД2", valueOf("okpd2")),
            reviewItem("ТН ВЭД", valueOf("tnved")),
            reviewItem("Соответствует требованиям", valueOf("standards")),
            reviewItem("Заявляемые показатели", valueOf("indicators"))
        ].join("");

        const warnings = buildWarnings();
        if (warnings.length) {
            reviewWarnings.hidden = false;
            reviewWarnings.innerHTML = `<strong>Обратите внимание:</strong><ul>${warnings.map(w => `<li>${escapeHtml(w)}</li>`).join("")}</ul>`;
        } else {
            reviewWarnings.hidden = true;
            reviewWarnings.innerHTML = "";
        }
        reviewModal.hidden = false;
        document.body.classList.add("modal-open");
        $("reviewSubmitBtn")?.focus();
    }

    function closeReview() {
        reviewModal.hidden = true;
        document.body.classList.remove("modal-open");
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        const errors = validateForm();
        updateProgress();
        if (errors.length) return;
        showReview();
    });

    $("reviewCloseBtn")?.addEventListener("click", closeReview);
    $("reviewEditBtn")?.addEventListener("click", closeReview);
    $("reviewSubmitBtn")?.addEventListener("click", () => {
        closeReview();
        form.submit();
    });
    reviewModal?.addEventListener("click", event => { if (event.target === reviewModal) closeReview(); });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && reviewModal && !reviewModal.hidden) closeReview();
    });

    // ---------- Toast ----------
    let toastTimer;
    function showToast(message) {
        const toast = $("toast");
        if (!toast) return;
        toast.textContent = message;
        toast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
    }

    // ---------- Инициализация ----------
    restoreGostSelection();
    filterGosts();
    syncManufacturer();
    updateProgress();
})();
