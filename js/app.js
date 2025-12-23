import { html, render } from 'https://esm.sh/htm/preact';
import { useState, useEffect } from 'https://esm.sh/preact/hooks';
import { storeLogText, getLogText, clearLogText } from './storage.js';
import { UploadPage } from './pages/upload.js';
import { DungeonListPage } from './pages/dungeon-list.js';
import { PlayerAnalysisPage } from './pages/player-analysis.js';

function App() {
    const [dungeons, setDungeons] = useState(/** @type {Dungeon[]} */([]));
    const [selectedDungeon, setSelectedDungeon] = useState(/** @type {Dungeon|null} */(null));
    const [selectedPlayer, setSelectedPlayer] = useState(/** @type {Combatant|null} */(null));
    const [loading, setLoading] = useState(false);

    // Load log from IndexedDB on mount
    useEffect(() => {
        const loadStoredLog = async () => {
            try {
                const storedLog = await getLogText();
                if (storedLog) {
                    setLoading(true);
                    const parser = new LogParser();
                    const parsedDungeons = parser.parse(storedLog);
                    setDungeons(parsedDungeons);
                    setLoading(false);

                    // Parse URL for selected dungeon and player
                    const params = new URLSearchParams(window.location.search);
                    const dungeonId = params.get('dungeon');
                    const playerId = params.get('player');

                    if (dungeonId && playerId) {
                        const dungeon = parsedDungeons.find(d => d.id === dungeonId);
                        if (dungeon) {
                            const player = dungeon.roster.find(p => p.playerId === playerId);
                            if (player) {
                                setSelectedDungeon(dungeon);
                                setSelectedPlayer(player);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Could not load stored log:', err);
                setLoading(false);
            }
        };

        loadStoredLog();
    }, []);

    // Handle browser back/forward
    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const dungeonId = params.get('dungeon');
            const playerId = params.get('player');

            if (!dungeonId || !playerId) {
                setSelectedDungeon(null);
                setSelectedPlayer(null);
            } else {
                const dungeon = dungeons.find(d => d.id === dungeonId);
                if (dungeon) {
                    const player = dungeon.roster.find(p => p.playerId === playerId);
                    if (player) {
                        setSelectedDungeon(dungeon);
                        setSelectedPlayer(player);
                    }
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [dungeons]);

    /**
     * @param {string} text
     */
    const handleFileSelect = async (text) => {
        setLoading(true);

        // Store log text in IndexedDB
        try {
            await storeLogText(text);
        } catch (err) {
            console.error('Could not store log:', err);
        }

        // Parse dungeons
        const parser = new LogParser();
        const parsedDungeons = parser.parse(text);

        if (parsedDungeons.length == 0)
            alert("There are no dungeons in this combat log");

        setDungeons(parsedDungeons);
        console.log('Parsed dungeons:', parsedDungeons);
        setLoading(false);

        // Clear URL params
        window.history.pushState({}, '', window.location.pathname);
    };

    /**
     * @param {Dungeon} dungeon
     * @param {Combatant} player
     */
    const handlePlayerSelect = (dungeon, player) => {
        setSelectedDungeon(dungeon);
        setSelectedPlayer(player);
        // Update URL with dungeon and player ID
        window.history.pushState(
            { dungeonId: dungeon.id, playerId: player.playerId },
            '',
            `?dungeon=${dungeon.id}&player=${player.playerId}`
        );
    };

    const backToDungeonList = () => {
        setSelectedDungeon(null);
        setSelectedPlayer(null);
        // Update URL to remove params
        window.history.pushState({}, '', window.location.pathname);
    };

    const resetApp = async () => {
        try {
            await clearLogText();
        } catch (err) {
            console.error('Could not clear log:', err);
        }
        setDungeons([]);
        setSelectedDungeon(null);
        setSelectedPlayer(null);
        window.history.pushState({}, '', window.location.pathname);
    };

    return html`
        <div class="container">
            <!-- App Shell Header -->
            <div style=${{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: '2px solid #e5e7eb'
            }}>
                <h1 style=${{ margin: 0, color: '#2563eb', fontSize: '28px' }}>
                    Fellowship Log Analyzer
                </h1>
                ${dungeons.length > 0 && html`
                    <button
                        onClick=${resetApp}
                        style=${{
                            background: '#d9534f',
                            cursor: 'pointer'
                        }}
                    >
                        Upload New File
                    </button>
                `}
            </div>

            <!-- Content Area -->
            ${loading && html`
                <div style=${{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div class="spinner"></div>
                    <p style=${{ marginTop: '20px', color: '#666', fontSize: '14px' }}>Parsing combat log...</p>
                </div>
            `}

            ${!loading && dungeons.length === 0 && html`
                <${UploadPage} onFileSelect=${handleFileSelect} />
            `}

            ${!loading && dungeons.length > 0 && !selectedPlayer && html`
                <${DungeonListPage}
                    dungeons=${dungeons}
                    onPlayerSelect=${handlePlayerSelect}
                />
            `}

            ${!loading && selectedPlayer && html`
                <${PlayerAnalysisPage}
                    dungeon=${selectedDungeon}
                    player=${selectedPlayer}
                    onBack=${backToDungeonList}
                />
            `}
        </div>
    `;
}

render(html`<${App} />`, document.getElementById('app') ?? document);
