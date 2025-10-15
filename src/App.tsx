import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  createContext,
} from "react";

// Declaración global para Google Maps
declare global {
  interface Window {
    google: any;
  }
}

// --- Estilos Globales y Animaciones ---
const GlobalStyles = () => (
  <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes cyborgPulse { 
          0%, 100% { 
            filter: drop-shadow(0 0 4px #FF4D4D) drop-shadow(0 0 8px #FF4D4D); 
            transform: scale(1); 
          } 
          50% { 
            filter: drop-shadow(0 0 8px #FF0000) drop-shadow(0 0 16px #FF0000); 
            transform: scale(1.05); 
          } 
        }
        @keyframes energyFlow { 
          from { stroke-dashoffset: 50; } 
          to { stroke-dashoffset: 0; } 
        }
        @keyframes rotate-top-face { 
          0%, 100% { transform: rotateY(0deg); } 
          50% { transform: rotateY(90deg); } 
        }
        @keyframes rotate-middle-face { 
          0%, 100% { transform: rotateX(0deg); } 
          50% { transform: rotateX(-90deg); } 
        }
        @keyframes lightsFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .bg-grid { 
          background-color: #0a101f; 
          background-image: 
            linear-gradient(rgba(0, 191, 255, 0.07) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(0, 191, 255, 0.07) 1px, transparent 1px); 
          background-size: 2rem 2rem; 
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', sans-serif;
        }
    `}</style>
);

// --- GENERADOR DE ICONOS TIPO PLACA DE SHERIFF MODERNA ---
const createModernBadge = (
  backgroundColor: string,
  text: string,
  hasLights: boolean = true
) => {
  const lightsSvg = hasLights
    ? `
    <!-- Luces/rotativos SUPERIORES externos -->
    <rect x="18" y="-8" width="16" height="8" fill="${backgroundColor}" stroke="black" stroke-width="0.5">
      <animate attributeName="fill" values="${backgroundColor};#FFFF00;${backgroundColor}" dur="1s" repeatCount="indefinite"/>
    </rect>
    <rect x="16" y="-8" width="2" height="8" fill="${backgroundColor}">
      <animate attributeName="fill" values="${backgroundColor};#FFFF00;${backgroundColor}" dur="1s" repeatCount="indefinite"/>
    </rect>
    <rect x="34" y="-8" width="2" height="8" fill="${backgroundColor}">
      <animate attributeName="fill" values="${backgroundColor};#FFFF00;${backgroundColor}" dur="1s" repeatCount="indefinite"/>
    </rect>
  `
    : "";

  return `<svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Forma de placa de sheriff moderna (pentágono) -->
    <path d="M26 4 L48 22 L40 52 L12 52 L4 22 Z" fill="${backgroundColor}" stroke="white" stroke-width="3"/>
    
    <!-- Sombra para mejor visibilidad -->
    <path d="M26 4 L48 22 L40 52 L12 52 L4 22 Z" fill="black" fill-opacity="0.2"/>
    
    <!-- Texto central -->
    <text x="26" y="36" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="14">${text}</text>
    
    ${lightsSvg}
  </svg>`;
};

const createAmbulanceBadge = (backgroundColor: string, text: string) => {
  return `<svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Forma de placa de sheriff moderna -->
    <path d="M26 4 L48 22 L40 52 L12 52 L4 22 Z" fill="${backgroundColor}" stroke="white" stroke-width="3"/>
    
    <!-- Sombra -->
    <path d="M26 4 L48 22 L40 52 L12 52 L4 22 Z" fill="black" fill-opacity="0.2"/>
    
    <!-- Cruz médica -->
    <rect x="22" y="24" width="8" height="12" fill="white"/>
    <rect x="18" y="28" width="16" height="4" fill="white"/>
    
    <!-- Texto -->
    <text x="26" y="48" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="10">${text}</text>
    
    <!-- Luces SUPERIORES externas -->
    <rect x="18" y="-8" width="16" height="8" fill="${backgroundColor}" stroke="black" stroke-width="0.5">
      <animate attributeName="fill" values="${backgroundColor};#FF0000;${backgroundColor}" dur="1s" repeatCount="indefinite"/>
    </rect>
  </svg>`;
};

const createFirefighterBadge = (backgroundColor: string, text: string) => {
  return `<svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Forma de placa de sheriff moderna -->
    <path d="M26 4 L48 22 L40 52 L12 52 L4 22 Z" fill="${backgroundColor}" stroke="white" stroke-width="3"/>
    
    <!-- Sombra -->
    <path d="M26 4 L48 22 L40 52 L12 52 L4 22 Z" fill="black" fill-opacity="0.2"/>
    
    <!-- Icono de bombero -->
    <path d="M26 20L22 26H30L26 20Z" fill="white"/>
    <rect x="24" y="26" width="4" height="8" fill="white"/>
    <rect x="22" y="34" width="8" height="2" fill="white"/>
    
    <!-- Texto -->
    <text x="26" y="48" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="10">${text}</text>
    
    <!-- Luces SUPERIORES externas -->
    <rect x="18" y="-8" width="16" height="8" fill="${backgroundColor}" stroke="black" stroke-width="0.5">
      <animate attributeName="fill" values="${backgroundColor};#FF6B00;${backgroundColor}" dur="1s" repeatCount="indefinite"/>
    </rect>
  </svg>`;
};

const createResourceBadge = (
  backgroundColor: string,
  text: string,
  symbol: string,
  hasLights: boolean = false
) => {
  const lightsSvg = hasLights
    ? `
    <rect x="18" y="-8" width="16" height="8" fill="${backgroundColor}" stroke="black" stroke-width="0.5">
      <animate attributeName="fill" values="${backgroundColor};#FFFF00;${backgroundColor}" dur="1s" repeatCount="indefinite"/>
    </rect>
  `
    : "";

  return `<svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Forma de placa de sheriff moderna -->
    <path d="M26 4 L48 22 L40 52 L12 52 L4 22 Z" fill="${backgroundColor}" stroke="white" stroke-width="3"/>
    
    <!-- Sombra -->
    <path d="M26 4 L48 22 L40 52 L12 52 L4 22 Z" fill="black" fill-opacity="0.2"/>
    
    <!-- Símbolo -->
    <text x="26" y="32" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="16">${symbol}</text>
    
    <!-- Texto -->
    <text x="26" y="48" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="9">${text}</text>
    
    ${lightsSvg}
  </svg>`;
};

// --- BIBLIOTECA DE ICONOS TIPO PLACA DE SHERIFF MODERNA ---
const unitIcons: { [key: string]: string } = {
  // POLICÍA - AZUL (CON LUCES)
  "Policía a pie": createModernBadge("#1E40AF", "P"),
  "Coche de policía": createModernBadge("#1E40AF", "C.P"),
  "Moto de policía": createModernBadge("#1E40AF", "M.P"),
  "Dron de policía": createModernBadge("#1E40AF", "D.P"),
  "Policía de paisano": createModernBadge("#1E40AF", "P.P"),
  "Cámaras policía": createModernBadge("#1E40AF", "CAM"),

  // PRIMER - NARANJA (CON LUCES)
  Ambulancia: createAmbulanceBadge("#EA580C", "AMB"),
  "Voluntarios Protección Civil": createModernBadge("#EA580C", "V.P.C"),

  // OTROS
  "Guardia Civil": createModernBadge("#059669", "G.C"), // CON LUCES
  Bomberos: createFirefighterBadge("#DC2626", "BOM"), // CON LUCES
  "Vigilantes de Seguridad Privada": createModernBadge("#7C3AED", "V.S.P"), // CON LUCES
  Civil: createResourceBadge("#6B7280", "CIV", "👤", false), // SIN LUCES
  Coche: createResourceBadge("#6B7280", "COCHE", "🚗", false), // SIN LUCES
  Moto: createResourceBadge("#6B7280", "MOTO", "🏍️", false), // SIN LUCES
  Camión: createResourceBadge("#6B7280", "CAMION", "🚚", false), // SIN LUCES

  // RECURSOS - DORADO/AMARILLO (SIN LUCES)
  Vallas: createResourceBadge("#F59E0B", "VALLAS", "⛔", false),
  Señales: createResourceBadge("#F59E0B", "SEÑALES", "🛑", false),
  Barreras: createResourceBadge("#F59E0B", "BARRERAS", "🚧", false),
  Iluminación: createResourceBadge("#F59E0B", "LUCES", "💡", false),
};

// ... (los componentes RubikCubeIcon, PoliceShieldIcon, ChevronDownIcon se mantienen igual)
const RubikCubeIcon = () => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: "drop-shadow(0 0 5px #2563EB)" }}
  >
    <rect
      x="20"
      y="20"
      width="60"
      height="60"
      rx="8"
      fill="none"
      stroke="#3B82F6"
      strokeWidth="3"
    />
    <g
      style={{
        transformOrigin: "50% 50%",
        animation: "rotate-middle-face 6s infinite ease-in-out",
      }}
    >
      <line x1="30" y1="40" x2="70" y2="40" stroke="#3B82F6" strokeWidth="2" />
      <line x1="30" y1="60" x2="70" y2="60" stroke="#3B82F6" strokeWidth="2" />
    </g>
    <g
      style={{
        transformOrigin: "50% 50%",
        animation: "rotate-top-face 6s infinite ease-in-out",
        animationDelay: "-3s",
      }}
    >
      <line x1="40" y1="30" x2="40" y2="70" stroke="#FBBF24" strokeWidth="2" />
      <line x1="60" y1="30" x2="60" y2="70" stroke="#FBBF24" strokeWidth="2" />
    </g>
    <circle
      cx="50"
      cy="50"
      r="5"
      fill="#FBBF24"
      style={{ filter: "drop-shadow(0 0 3px #FBBF24)" }}
    />
  </svg>
);

const PoliceShieldIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50 5 L15 20 V 50 C 15 75, 50 95, 50 95 C 50 95, 85 75, 85 50 V 20 Z"
      stroke="#00BFFF"
      strokeWidth="3"
      fill="#111827"
      style={{ filter: "drop-shadow(0 0 5px #00BFFF)" }}
    />
    <circle
      cx="50"
      cy="50"
      r="8"
      fill="#FF0000"
      style={{ animation: "cyborgPulse 2.5s infinite ease-in-out" }}
    />
    <g
      stroke="#FF4D4D"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: "energyFlow 5s linear infinite" }}
    >
      <path
        d="M50 42 V 25 M 50 58 V 75 M 42 50 H 25 M 58 50 H 75"
        strokeDasharray="50"
      />
      <path
        d="M50 50 L 35 35 M50 50 L 65 35 M50 50 L 35 65 M50 50 L 65 65"
        strokeDasharray="50"
        style={{ animationDelay: "-2.5s" }}
      />
    </g>
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- TIPOS Y INTERFACES ---
interface Unit {
  id: string;
  type: string;
  position: { lat: number; lng: number };
  name: string;
  agents: string[];
  missions: string;
}

interface AppContextType {
  isMapApiLoaded: boolean;
  deployedUnits: Unit[];
  selectedUnitId: string | null;
  handleMapReady: (map: any) => void;
  handleAddUnit: (unitType: string) => void;
  handleUnitMove: (
    unitId: string,
    newPosition: { lat: number; lng: number }
  ) => void;
  handleUnitSelect: (unitId: string | null) => void;
  handleUnitDelete: (unitId: string) => void;
}

// --- CONTEXTO GLOBAL DE LA APLICACIÓN ---
const AppContext = createContext<AppContextType | null>(null);
const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe usarse dentro de AppProvider");
  }
  return context;
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMapApiLoaded, setMapApiLoaded] = useState(false);
  const [deployedUnits, setDeployedUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const mapInstanceRef = useRef<any>(null);

  const handleMapReady = useCallback((map: any) => {
    mapInstanceRef.current = map;
  }, []);

  const handleAddUnit = useCallback((unitType: string) => {
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      type: unitType,
      position: { lat: 40.2443, lng: -3.6996 },
      name: `${unitType} #${String(Date.now()).slice(-4)}`,
      agents: ["Operativo 1", "Operativo 2"],
      missions: "Desplegado en zona asignada. En espera de instrucciones.",
    };
    setDeployedUnits((prev) => [...prev, newUnit]);
  }, []);

  const handleUnitMove = useCallback(
    (unitId: string, newPosition: { lat: number; lng: number }) => {
      setDeployedUnits((prevUnits) =>
        prevUnits.map((u) =>
          u.id === unitId ? { ...u, position: newPosition } : u
        )
      );
    },
    []
  );

  const handleUnitSelect = useCallback((unitId: string | null) => {
    setSelectedUnitId(unitId);
  }, []);

  const handleUnitDelete = useCallback((unitId: string) => {
    setDeployedUnits((prev) => prev.filter((unit) => unit.id !== unitId));
    setSelectedUnitId(null);
  }, []);

  // Cargar Google Maps API
  useEffect(() => {
    if (window.google) {
      setMapApiLoaded(true);
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      if (window.google) setMapApiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCwMRuD-I2AIpTBYV3D8G5fyBKQQ-6aQrc&libraries=geometry,drawing`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setMapApiLoaded(true);
    };

    script.onerror = () => {
      console.error("Error cargando Google Maps");
      setMapApiLoaded(false);
    };

    document.head.appendChild(script);
  }, []);

  const value: AppContextType = {
    isMapApiLoaded,
    deployedUnits,
    selectedUnitId,
    handleMapReady,
    handleAddUnit,
    handleUnitMove,
    handleUnitSelect,
    handleUnitDelete,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Componentes de UI ---
const UnitDetailModal = () => {
  const { deployedUnits, selectedUnitId, handleUnitSelect, handleUnitDelete } =
    useApp();
  const unit = deployedUnits.find((u) => u.id === selectedUnitId);

  const handleClose = () => {
    handleUnitSelect(null);
  };

  const handleDelete = () => {
    if (unit) {
      handleUnitDelete(unit.id);
    }
  };

  if (!unit) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={handleClose}
    >
      <div
        className="bg-gray-900 border border-cyan-500/50 rounded-lg shadow-2xl w-full max-w-lg p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">
          {unit.type} - Detalles
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Nombre / Identificador
            </label>
            <p className="w-full bg-gray-800 rounded-md p-2 mt-1">
              {unit.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Personal
            </label>
            <p className="w-full bg-gray-800 rounded-md p-2 mt-1 min-h-[40px]">
              {unit.agents.join(", ")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Misiones Asignadas
            </label>
            <p className="w-full bg-gray-800 rounded-md p-2 mt-1 min-h-[96px]">
              {unit.missions}
            </p>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleDelete}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Eliminar Unidad
          </button>
          <button
            onClick={handleClose}
            className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const SubButton = ({
  text,
  isSubMenu = false,
  isOpen = false,
  onClick = () => {},
}: {
  text: string;
  isSubMenu?: boolean;
  isOpen?: boolean;
  onClick?: () => void;
}) => {
  const { handleAddUnit } = useApp();

  const containsText = (textToCheck: string, searchText: string) => {
    return textToCheck.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
  };

  const isDestructive =
    containsText(text, "eliminar") || containsText(text, "borrar");
  const isUnit = Object.keys(unitIcons).indexOf(text) !== -1;

  const handleClick = () => {
    if (isUnit) handleAddUnit(text);
    else onClick();
  };

  const baseClasses =
    "w-full flex justify-between items-center text-left p-3 text-sm rounded-md transition-all duration-200 relative overflow-hidden group";
  const colorClasses = isDestructive
    ? "bg-gray-800/50 text-red-400 hover:bg-red-900/50 hover:text-red-300"
    : "bg-gray-800/50 text-gray-400 hover:bg-cyan-900/40 hover:text-cyan-300";

  return (
    <button onClick={handleClick} className={`${baseClasses} ${colorClasses}`}>
      <span>{text}</span>
      {isSubMenu && (
        <ChevronDownIcon
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      )}
      {!isDestructive && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
      )}
      {isDestructive && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
      )}
    </button>
  );
};

// MENU DATA ACTUALIZADO CON HERRAMIENTAS DE DIBUJO
const menuData = [
  {
    id: "dispositivo",
    title: "Tipo de Dispositivo",
    options: [
      "Cargar dispositivo",
      "Nuevo Dispositivo",
      "Orden de servicio",
      "D.E.C.",
      "Dispositivo de Seguridad",
      "Informes",
    ],
  },
  {
    id: "mapa",
    title: "Zona/Mapa",
    options: [
      "Seleccionar/Editar zona",
      "Confirmar zona",
      "Eliminar/Borrar zona",
      "Herramientas de dibujo",
    ],
  },
  {
    id: "unidades",
    title: "Unidades/Recursos",
    subMenus: {
      Policía: [
        "Policía a pie",
        "Coche de policía",
        "Moto de policía",
        "Dron de policía",
        "Policía de paisano",
        "Cámaras policía",
      ],
      Pimer: ["Ambulancia", "Voluntarios Protección Civil"],
      Otros: [
        "Guardia Civil",
        "Bomberos",
        "Vigilantes de Seguridad Privada",
        "Civil",
        "Coche",
        "Moto",
        "Camión",
      ],
      Recursos: ["Vallas", "Señales", "Barreras", "Iluminación"],
    },
  },
  {
    id: "ia",
    title: "I.A.",
    options: [
      "Dar instrucciones/contexto",
      "Asignar misiones I.A.",
      "Analizar zona seleccionada",
    ],
  },
  {
    id: "generar",
    title: "Generar Dispositivo/Informe",
    options: [
      "Previsualizar",
      "Hacer correcciones",
      "Editar",
      "Compartir",
      "Guardar",
    ],
  },
];

const AccordionItem = ({
  item,
  isOpen,
  onClick,
}: {
  item: any;
  isOpen: boolean;
  onClick: () => void;
}) => {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) setOpenSubMenu(null);
  }, [isOpen]);

  const toggleSubMenu = (subMenuTitle: string) => {
    setOpenSubMenu(openSubMenu === subMenuTitle ? null : subMenuTitle);
  };

  return (
    <div className="px-3 py-2">
      <button
        onClick={onClick}
        className={`w-full flex justify-between items-center text-left p-4 text-gray-300 focus:outline-none transition-all duration-300 relative overflow-hidden group rounded-lg border border-transparent ${
          isOpen
            ? "bg-cyan-900/50 text-white border-cyan-700/50"
            : "bg-gray-800/50 hover:bg-gray-700/50"
        }`}
      >
        <span
          className={`font-semibold text-base z-10 ${
            isOpen ? "text-cyan-300" : ""
          }`}
        >
          {item.title}
        </span>
        <ChevronDownIcon
          className={`transform transition-transform duration-300 z-10 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
      </button>

      {isOpen && (
        <div className="bg-gray-900/50 p-2 mt-1 rounded-md space-y-2">
          {item.options &&
            item.options.map((option: string) => (
              <SubButton key={option} text={option} />
            ))}
          {item.subMenus &&
            Object.keys(item.subMenus).map((subMenuTitle: string) => (
              <div key={subMenuTitle}>
                <SubButton
                  text={subMenuTitle}
                  isSubMenu={true}
                  isOpen={openSubMenu === subMenuTitle}
                  onClick={() => toggleSubMenu(subMenuTitle)}
                />
                {openSubMenu === subMenuTitle && (
                  <div className="pl-4 mt-2 space-y-2">
                    {item.subMenus[subMenuTitle].map((subOption: string) => (
                      <SubButton key={subOption} text={subOption} />
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const [openItemId, setOpenItemId] = useState<string | null>("unidades");

  return (
    <aside className="w-96 bg-gray-900/80 backdrop-blur-sm text-white flex flex-col h-full overflow-y-auto border-r border-cyan-500/20 shadow-2xl">
      <div className="h-24 p-4 border-b border-cyan-500/20 flex items-center justify-center space-x-4 bg-gray-900/50 flex-shrink-0">
        <RubikCubeIcon />
        <h2
          className="text-3xl font-bold tracking-widest uppercase"
          style={{ textShadow: "0 0 5px #2563EB, 0 0 10px #2563EB" }}
        >
          Mando Táctico
        </h2>
      </div>
      <nav className="py-2 flex-grow">
        {menuData.map((item) => (
          <AccordionItem
            key={item.id}
            item={item}
            isOpen={openItemId === item.id}
            onClick={() =>
              setOpenItemId(openItemId === item.id ? null : item.id)
            }
          />
        ))}
      </nav>
    </aside>
  );
};

const AppHeader = () => (
  <header className="h-24 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center text-white border-b border-cyan-500/20 shadow-lg relative flex-shrink-0">
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-4 group cursor-pointer">
        <h1
          className="text-5xl font-bold tracking-widest uppercase transition-all duration-300 group-hover:text-cyan-300"
          style={{ textShadow: "0 0 8px #00BFFF, 0 0 15px #00BFFF" }}
        >
          Polic-IA
        </h1>
        <div className="group-hover:scale-110 transition-transform duration-300">
          <PoliceShieldIcon />
        </div>
      </div>
      <p
        className="text-base text-cyan-400/80 tracking-widest mt-2"
        style={{ textShadow: "0 0 5px #00BFFF" }}
      >
        La Inteligencia Artificial al servicio de la seguridad
      </p>
    </div>
  </header>
);

// Componente de Google Maps real - CORREGIDO PARA MANTENER ZOOM
const GoogleMapComponent = () => {
  const { deployedUnits, selectedUnitId, handleUnitSelect, handleUnitMove } =
    useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const isInitializedRef = useRef(false);

  // SOLUCIÓN DEFINITIVA: Inicializar el mapa UNA sola vez
  useEffect(() => {
    if (!mapContainerRef.current || !window.google || isInitializedRef.current)
      return;

    const pintoCoords = { lat: 40.2443, lng: -3.6996 };

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: pintoCoords,
      zoom: 14,
      disableDefaultUI: false,
      zoomControl: true,
      scaleControl: true,
      mapTypeControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      gestureHandling: "greedy",
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],
    });

    mapRef.current = map;
    isInitializedRef.current = true;

    // SOLO crear/actualizar marcadores, NO recrear el mapa
    const updateMarkers = () => {
      // Limpiar solo marcadores que ya no existen
      Object.keys(markersRef.current).forEach((key) => {
        if (!deployedUnits.find((unit) => unit.id === key)) {
          markersRef.current[key].setMap(null);
          delete markersRef.current[key];
        }
      });

      // Crear/actualizar marcadores existentes
      deployedUnits.forEach((unit) => {
        if (!markersRef.current[unit.id]) {
          const svgIcon = {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(unitIcons[unit.type]),
            scaledSize: new window.google.maps.Size(52, 60),
            anchor: new window.google.maps.Point(26, 60),
          };

          const marker = new window.google.maps.Marker({
            position: unit.position,
            map: map,
            icon: svgIcon,
            draggable: true,
            title: unit.name,
          });

          marker.addListener("click", () => {
            handleUnitSelect(unit.id);
          });

          marker.addListener("dragend", (e: any) => {
            if (e.latLng) {
              // NO modificar el zoom - el mapa mantiene su estado automáticamente
              handleUnitMove(unit.id, {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              });
            }
          });

          markersRef.current[unit.id] = marker;
        } else {
          // Actualizar posición del marcador existente
          markersRef.current[unit.id].setPosition(unit.position);
        }
      });
    };

    updateMarkers();
  }, []); // <-- Array de dependencias VACÍO - se ejecuta solo una vez

  // Actualizar marcadores cuando cambian las unidades
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    // Solo actualizar marcadores, no recrear el mapa
    Object.keys(markersRef.current).forEach((key) => {
      if (!deployedUnits.find((unit) => unit.id === key)) {
        markersRef.current[key].setMap(null);
        delete markersRef.current[key];
      }
    });

    deployedUnits.forEach((unit) => {
      if (!markersRef.current[unit.id]) {
        const svgIcon = {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(unitIcons[unit.type]),
          scaledSize: new window.google.maps.Size(52, 60),
          anchor: new window.google.maps.Point(26, 60),
        };

        const marker = new window.google.maps.Marker({
          position: unit.position,
          map: mapRef.current,
          icon: svgIcon,
          draggable: true,
          title: unit.name,
        });

        marker.addListener("click", () => {
          handleUnitSelect(unit.id);
        });

        marker.addListener("dragend", (e: any) => {
          if (e.latLng) {
            handleUnitMove(unit.id, {
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            });
          }
        });

        markersRef.current[unit.id] = marker;
      } else {
        markersRef.current[unit.id].setPosition(unit.position);
      }
    });
  }, [deployedUnits, handleUnitSelect, handleUnitMove]);

  // Animación para la unidad seleccionada
  useEffect(() => {
    Object.keys(markersRef.current).forEach((unitId) => {
      const marker = markersRef.current[unitId];
      if (unitId === selectedUnitId) {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
      } else {
        marker.setAnimation(null);
      }
    });
  }, [selectedUnitId]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Contador de unidades */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-3 rounded-lg border border-cyan-500/50">
        <div className="text-cyan-300 font-bold">
          🎯 Unidades: {deployedUnits.length}
        </div>
      </div>

      {/* Panel de herramientas de dibujo (placeholder) */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg border border-cyan-500/50">
        <div className="text-cyan-300 font-bold">🛠️ Herramientas de Zona</div>
        <div className="text-xs text-gray-400 mt-1">Próxima implementación</div>
      </div>
    </div>
  );
};

// Wrapper para cargar Google Maps
const MapWrapper = () => {
  const { isMapApiLoaded } = useApp();

  if (!isMapApiLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p>Cargando Google Maps...</p>
          <p className="text-sm text-gray-400 mt-2">
            Conectando con API de Google...
          </p>
        </div>
      </div>
    );
  }

  return <GoogleMapComponent />;
};

const AppContent = () => {
  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="flex h-screen bg-gray-900"
    >
      <GlobalStyles />
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <AppHeader />
        <div className="flex-1">
          <MapWrapper />
        </div>
      </main>
      <UnitDetailModal />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
