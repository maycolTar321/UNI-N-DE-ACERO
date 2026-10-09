"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
var API_URL = "https://script.google.com/macros/s/AKfycbx_rZ0Uwf3ogHY6SFNSb1q5cPgVpys0TDhCWc2Hb_loRPS30HCJ5EY6yVpFAXcJPZlWSA/exec";
/**
 * Los estados extendidos se guardan en observaciones para evitar que el backend
 * normalice el campo heredado "estado". También leemos el formato antiguo
 * (metadatos dentro de "estado") para no perder los datos ya registrados.
 */
/**
 * Compatibilidad con los dos formatos históricos de la hoja:
 * - estados extendidos dentro de la columna "estado"
 * - estados extendidos dentro de "observaciones"
 *
 * Se leen AMBAS columnas; un bloque JSON vacío no debe impedir leer el otro.
 */
function restaurarMetadatosAfiliado(afiliado) {
    if (!afiliado || typeof afiliado !== "object")
        return afiliado;
    var metadatos = {};
    for (var _i = 0, _a = ["estado", "observaciones"]; _i < _a.length; _i++) {
        var campo = _a[_i];
        var valor = afiliado[campo];
        if (typeof valor !== "string" || !valor.includes("|_JSON_|"))
            continue;
        var partes = valor.split("|_JSON_|");
        afiliado[campo] = partes[0] || "";
        var json = partes.slice(1).join("|_JSON_|").trim();
        if (!json)
            continue;
        try {
            var extras = JSON.parse(json);
            if (extras && typeof extras === "object" && !Array.isArray(extras)) {
                // No permitir que un JSON vacío borre metadatos útiles de la otra columna.
                Object.assign(metadatos, extras);
            }
        }
        catch (error) {
            console.error("No se pudieron restaurar los metadatos de ".concat(campo, ":"), error);
        }
    }
    Object.assign(afiliado, metadatos);
    // En filas antiguas, el campo estado puede contener únicamente el marcador JSON.
    if (!afiliado.estado && afiliado.estado_afiliacion) {
        afiliado.estado = afiliado.estado_afiliacion;
    }
    afiliado.estado_afiliacion = afiliado.estado_afiliacion || afiliado.estado || "PENDIENTE";
    afiliado.estado_operativo = afiliado.estado_operativo || "INACTIVO";
    afiliado.estado_expediente = afiliado.estado_expediente || "INCOMPLETO";
    afiliado.estado_carnet = afiliado.estado_carnet || "PENDIENTE";
    return afiliado;
}
/**
 * La hoja actual NO tiene columnas para estado_afiliacion, estado_operativo,
 * estado_expediente, estado_carnet, documentos o coordenadas. Por eso se
 * persisten en observaciones usando el marcador que la app ya venía usando.
 */
function prepararAfiliadoParaGuardar(afiliado) {
    var base = __assign({}, (afiliado || {}));
    var extraKeys = [
        "estado_afiliacion",
        "estado_operativo",
        "estado_expediente",
        "estado_carnet",
        "documentos",
        "coordenadas_domicilio",
        "coordenadas_empresa",
    ];
    var extras = {};
    for (var _i = 0, extraKeys_1 = extraKeys; _i < extraKeys_1.length; _i++) {
        var key = extraKeys_1[_i];
        if (base[key] !== undefined) {
            extras[key] = base[key];
            // Do not delete from base so if columns exist they get updated natively
        }
    }
    var limpiarMarcador = function (value) {
        return typeof value === "string" ? value.split("|_JSON_|")[0] : (value !== null && value !== void 0 ? value : "");
    };
    var observacionesBase = String(limpiarMarcador(base.observaciones) || "");
    var estadoBase = String(limpiarMarcador(base.estado) || "");
    // La columna "estado" debe guardar un estado simple, no un objeto JSON.
    base.estado = extras.estado_afiliacion || estadoBase || "PENDIENTE";
    // Evitar escribir metadatos dentro de ambas columnas: usar observaciones.
    if (Object.keys(extras).length > 0) {
        base.observaciones =
            observacionesBase + "|_JSON_|" + JSON.stringify(extras);
    }
    else {
        base.observaciones = observacionesBase;
    }
    return base;
}
var esperar = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
function encontrarPorId(afiliados, id) {
    return afiliados.find(function (a) { var _a; return String((_a = a.id) !== null && _a !== void 0 ? _a : "").trim() === String(id).trim(); });
}
/**
 * Google Apps Script se llama con no-cors para evitar el preflight del navegador.
 * no-cors oculta la respuesta del POST, así que NUNCA debemos anunciar éxito
 * sin volver a leer Google Sheets y comprobar que el cambio quedó guardado.
 */
function verificarGuardado(id_1, esperado_1) {
    return __awaiter(this, arguments, void 0, function (id, esperado, intentos) {
        var ultimo, intento, consulta, comprobaciones, camposAComprobar, coincide, estadoReal;
        if (intentos === void 0) { intentos = 4; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    intento = 0;
                    _a.label = 1;
                case 1:
                    if (!(intento < intentos)) return [3 /*break*/, 5];
                    return [4 /*yield*/, esperar(intento === 0 ? 350 : 650)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, exports.api.getAfiliados()];
                case 3:
                    consulta = _a.sent();
                    if (consulta.exito && Array.isArray(consulta.datos)) {
                        ultimo = encontrarPorId(consulta.datos, id);
                        if (ultimo) {
                            comprobaciones = [
                                "estado_afiliacion",
                                "estado_operativo"
                            ];
                            camposAComprobar = comprobaciones.filter(function (campo) { return esperado[campo] !== undefined; });
                            coincide = camposAComprobar.length > 0 && camposAComprobar.every(function (campo) {
                                var valorEsperado = esperado[campo];
                                var valorReal = ultimo === null || ultimo === void 0 ? void 0 : ultimo[campo];
                                return String(valorReal !== null && valorReal !== void 0 ? valorReal : "").trim().toUpperCase() ===
                                    String(valorEsperado !== null && valorEsperado !== void 0 ? valorEsperado : "").trim().toUpperCase();
                            });
                            if (coincide) {
                                return [2 /*return*/, { exito: true, mensaje: "Cambios guardados y verificados en Google Sheets." }];
                            }
                        }
                    }
                    _a.label = 4;
                case 4:
                    intento++;
                    return [3 /*break*/, 1];
                case 5:
                    estadoReal = ultimo
                        ? "Estado que sigue en la hoja: afiliaci\u00F3n=".concat(ultimo.estado_afiliacion || "SIN DATO", ", operativo=").concat(ultimo.estado_operativo || "SIN DATO", ".")
                        : "No se pudo volver a leer el afiliado desde Google Sheets.";
                    return [2 /*return*/, {
                            exito: false,
                            mensaje: "Google Sheets no confirm\u00F3 los cambios. ".concat(estadoReal, " Revisa que el despliegue de Apps Script est\u00E9 actualizado y tenga acceso a la hoja.")
                        }];
            }
        });
    });
}
exports.api = {
    actualizarVigencia: function (ciOId, nuevaVigencia) { return __awaiter(void 0, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_URL, {
                            method: "POST",
                            mode: "no-cors",
                            headers: {
                                "Content-Type": "text/plain;charset=utf-8",
                            },
                            body: JSON.stringify({
                                accion: "renovarVigencia",
                                id: ciOId,
                                vigencia: nuevaVigencia,
                            }),
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { exito: true, mensaje: "Vigencia renovada exitosamente" }];
                case 2:
                    e_1 = _a.sent();
                    console.error("Error renovando vigencia:", e_1);
                    return [2 /*return*/, { exito: false, mensaje: "Error al conectar con el servidor" }];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    getAfiliados: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "?accion=listarAfiliados&_ts=").concat(Date.now()), { cache: "no-store" })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (Array.isArray(data.datos)) {
                        data.datos = data.datos.map(function (a) { return restaurarMetadatosAfiliado(a); });
                    }
                    return [2 /*return*/, data];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error fetching afiliados:", error_1);
                    return [2 /*return*/, { exito: false, mensaje: "No pudimos conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.", error: error_1.message }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    registrarAfiliado: function (afiliado) { return __awaiter(void 0, void 0, void 0, function () {
        var baseData, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    baseData = prepararAfiliadoParaGuardar(afiliado);
                    return [4 /*yield*/, fetch(API_URL, {
                            method: "POST",
                            mode: "no-cors",
                            headers: {
                                "Content-Type": "text/plain;charset=utf-8",
                            },
                            body: JSON.stringify({
                                accion: "registrarAfiliado",
                                datos: baseData,
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    // En modo no-cors no es posible leer la respuesta HTTP. La lista debe refrescarse
                    // después del guardado para confirmar el estado persistido.
                    return [2 /*return*/, { exito: true, mensaje: "Solicitud enviada. Actualiza la lista para verificar el guardado." }];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error registrando afiliado:", error_2);
                    return [2 /*return*/, { exito: false, mensaje: "No pudimos conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.", error: error_2.message }];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // Preparando la arquitectura para las demás funciones solicitadas
    getAfiliado: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "?accion=obtenerAfiliado&id=").concat(id), { cache: 'no-store' })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.datos) {
                        data.datos = restaurarMetadatosAfiliado(data.datos);
                    }
                    return [2 /*return*/, data];
                case 3:
                    error_3 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexin." }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    actualizarAfiliado: function (id, datos) { return __awaiter(void 0, void 0, void 0, function () {
        var datosActualizacion, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    datosActualizacion = prepararAfiliadoParaGuardar(datos);
                    return [4 /*yield*/, fetch(API_URL, {
                            method: "POST",
                            mode: "no-cors",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({ accion: "actualizarAfiliado", id: id, datos: datosActualizacion }),
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, verificarGuardado(String(id), datos)];
                case 2: 
                // El POST no-cors no permite leer el resultado del servidor.
                // Comprobamos los datos reales después de escribir; si no coinciden,
                // devolvemos error para que la pantalla no finja que se guardó.
                return [2 /*return*/, _a.sent()];
                case 3:
                    error_4 = _a.sent();
                    console.error("Error actualizando afiliado:", error_4);
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexi\u00F3n al guardar: ".concat((error_4 === null || error_4 === void 0 ? void 0 : error_4.message) || "desconocido") }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    eliminarAfiliado: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_URL, {
                            method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({ accion: "eliminarAfiliado", id: id }),
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { exito: true }];
                case 2:
                    error_5 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    cambiarEstadoAfiliado: function (id, estado) { return __awaiter(void 0, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_URL, {
                            method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({ accion: "cambiarEstadoAfiliado", id: id, estado: estado }),
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { exito: true }];
                case 2:
                    error_6 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    getEmpresas: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "?accion=listarEmpresas"), { cache: 'no-store' })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_7 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    registrarEmpresa: function (empresa) { return __awaiter(void 0, void 0, void 0, function () {
        var error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_URL, {
                            method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({ accion: "registrarEmpresa", datos: empresa }),
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { exito: true }];
                case 2:
                    error_8 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    getHistorial: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "?accion=obtenerHistorial"), { cache: 'no-store' })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_9 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    getDashboard: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "?accion=dashboard"), { cache: 'no-store' })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_10 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    // ===== USUARIOS DEL SISTEMA (ACCESOS) =====
    listarUsuarios: function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(API_URL, "?accion=listarUsuarios"), { cache: 'no-store' })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_11 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    crearUsuario: function (nombre, pin, rol) { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    params = new URLSearchParams({ accion: "crearUsuario", nombre: nombre, pin: pin, rol: rol });
                    return [4 /*yield*/, fetch("".concat(API_URL, "?").concat(params.toString()), { cache: 'no-store' })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_12 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    eliminarUsuario: function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    params = new URLSearchParams({ accion: "eliminarUsuario", id: id });
                    return [4 /*yield*/, fetch("".concat(API_URL, "?").concat(params.toString()), { cache: 'no-store' })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_13 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    validarPin: function (pin) { return __awaiter(void 0, void 0, void 0, function () {
        var params, response, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    params = new URLSearchParams({ accion: "validarPin", pin: pin });
                    return [4 /*yield*/, fetch("".concat(API_URL, "?").concat(params.toString()), { cache: 'no-store' })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    error_14 = _a.sent();
                    return [2 /*return*/, { exito: false, mensaje: "Error de conexión." }];
                case 4: return [2 /*return*/];
            }
        });
    }); }
};
