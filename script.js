// Game State
const gameState = {
    inventory: [],
    switches: ['', '', '', '', ''], // U or D for each switch
    lockPanel: {
        activated: false,
        cardInserted: false
    },
    locker: {
        freeOpened: false,
        lockedOpened: false
    },
    drawers: {
        noHandleOpened: false,
        lockedOpened: false
    },
    hiddenSafeOpened: false,
    portableSafeOpened: false,
    pictureFallen: false,
    memosCombined: false,
    escaped: false
};

// Game Data
const gameData = {
    hiddenSafeCode: 'UDUUU',
    portableSafeCode: '731',
    drawerLockCode: '613',
    exitPassword: '5391'
};

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function initializeGame() {
    // View Toggle
    document.getElementById('front-view-btn').addEventListener('click', () => switchView('front'));
    document.getElementById('back-view-btn').addEventListener('click', () => switchView('back'));

    // Front View
    initializeLockPanel();

    // Back View
    initializeWallPicture();
    initializeStudyTable();
    initializeLocker();
    initializeHiddenSafe();

    // Modal
    initializeModal();

    updateInventoryDisplay();
}

function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('#view-toggle button').forEach(b => b.classList.remove('active'));

    if (view === 'front') {
        document.getElementById('front-view').classList.add('active');
        document.getElementById('front-view-btn').classList.add('active');
    } else {
        document.getElementById('back-view').classList.add('active');
        document.getElementById('back-view-btn').classList.add('active');
    }
}

// Lock Panel (Front View)
function initializeLockPanel() {
    document.getElementById('lock-panel').addEventListener('click', () => {
        if (!gameState.lockPanel.activated) {
            gameState.lockPanel.activated = true;
            document.getElementById('panel-message').textContent = 'カードキーを挿入して下さい';
            document.getElementById('card-slot').classList.remove('hidden');
            if (gameState.inventory.includes('カードキー')) {
                document.getElementById('insert-card-btn').classList.remove('hidden');
            }
        }
    });

    document.getElementById('insert-card-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (gameState.inventory.includes('カードキー')) {
            gameState.lockPanel.cardInserted = true;
            document.getElementById('panel-message').textContent = '解除パスワード（数字４桁）を入力して下さい';
            document.getElementById('card-slot').classList.add('hidden');
            document.getElementById('password-input').classList.remove('hidden');
            showMessage('カードキーを挿入しました', 'info');
        }
    });

    document.getElementById('submit-password-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const password = document.getElementById('password-field').value;
        if (password === gameData.exitPassword) {
            gameState.escaped = true;
            document.getElementById('panel-message').textContent = 'ロック解除！脱出成功！';
            document.getElementById('door-element').classList.add('unlocked');
            document.getElementById('door-element').textContent = '脱出成功！';
            document.getElementById('password-input').classList.add('hidden');
            showMessage('おめでとうございます！脱出に成功しました！', 'success');
        } else {
            showMessage('パスワードが違います', 'error');
        }
    });
}

// Wall Picture (Back View)
function initializeWallPicture() {
    document.getElementById('wall-picture').addEventListener('click', () => {
        if (gameState.pictureFallen) {
            showModalDialog('絵の裏', '絵の裏に暗号が書かれています：<br><strong>UUXYEA</strong><br><br>これはキーボードのキートップでひらがなを表しています。');
        } else if (gameState.inventory.includes('モップ')) {
            showModalDialog('モップを使う', 'モップで絵を落としますか？', [
                {
                    text: 'はい',
                    action: () => {
                        gameState.pictureFallen = true;
                        showMessage('絵を落としました！絵の裏に暗号が書いてあります。', 'success');
                        closeModal();
                        // Reveal the cipher UUXYEA = 7.3.1
                        setTimeout(() => {
                            showModalDialog('絵の裏の暗号', 'UUXYEA<br>キーボードのキートップでひらがなに直すと：<br><strong>ななさんいち（7.3.1）</strong>');
                        }, 500);
                    }
                },
                {
                    text: 'いいえ',
                    action: closeModal
                }
            ]);
        } else {
            showMessage('手が届きません。何か道具が必要です。', 'info');
        }
    });
}

// Study Table (Back View)
function initializeStudyTable() {
    // Portable Safe
    document.getElementById('portable-safe').addEventListener('click', (e) => {
        e.stopPropagation();
        if (gameState.portableSafeOpened) {
            showMessage('すでに開けてあります。', 'info');
        } else {
            showPortableSafeModal();
        }
    });

    // Table Items
    document.getElementById('locker-key-item').addEventListener('click', (e) => {
        e.stopPropagation();
        if (!gameState.inventory.includes('ロッカーの鍵')) {
            addToInventory('ロッカーの鍵');
            e.target.classList.add('taken');
            showMessage('ロッカーの鍵を取得しました', 'success');
        }
    });

    document.getElementById('pencil-item').addEventListener('click', (e) => {
        e.stopPropagation();
        if (!gameState.inventory.includes('エンピツ')) {
            addToInventory('エンピツ');
            e.target.classList.add('taken');
            showMessage('エンピツを取得しました', 'success');
        }
    });

    document.getElementById('blank-memo-item').addEventListener('click', (e) => {
        e.stopPropagation();
        if (!gameState.inventory.includes('白紙のメモ')) {
            if (gameState.inventory.includes('エンピツ')) {
                showModalDialog('白紙のメモ', 'エンピツでこすってみますか？', [
                    {
                        text: 'はい',
                        action: () => {
                            addToInventory('こすり出したメモ（613）');
                            e.target.classList.add('taken');
                            showMessage('メモに数字が浮かび上がりました：613', 'success');
                            closeModal();
                        }
                    },
                    {
                        text: 'いいえ',
                        action: () => {
                            addToInventory('白紙のメモ');
                            e.target.classList.add('taken');
                            closeModal();
                        }
                    }
                ]);
            } else {
                addToInventory('白紙のメモ');
                e.target.classList.add('taken');
                showMessage('白紙のメモを取得しました', 'success');
            }
        }
    });

    // Drawers
    document.getElementById('drawer-no-handle').addEventListener('click', (e) => {
        e.stopPropagation();
        if (gameState.drawers.noHandleOpened) {
            showMessage('引き出しは空です', 'info');
        } else if (gameState.inventory.includes('取手')) {
            showModalDialog('引き出しを開ける', '取手を使って引き出しを開けますか？', [
                {
                    text: 'はい',
                    action: () => {
                        gameState.drawers.noHandleOpened = true;
                        document.getElementById('drawer-no-handle').classList.add('opened');
                        addToInventory('UDUUUの紙');
                        showMessage('引き出しの中に「UDUUU」と書かれた紙がありました', 'success');
                        closeModal();
                    }
                },
                {
                    text: 'いいえ',
                    action: closeModal
                }
            ]);
        } else {
            showMessage('取手がないので開けられません', 'info');
        }
    });

    document.getElementById('drawer-with-lock').addEventListener('click', (e) => {
        e.stopPropagation();
        if (gameState.drawers.lockedOpened) {
            showMessage('引き出しは空です', 'info');
        } else {
            showDrawerLockModal();
        }
    });
}

// Locker (Back View)
function initializeLocker() {
    document.getElementById('locker-door-free').addEventListener('click', (e) => {
        e.stopPropagation();
        if (!gameState.locker.freeOpened) {
            gameState.locker.freeOpened = true;
            document.getElementById('locker-door-free').classList.add('opened');
            addToInventory('取手');
            showMessage('ロッカーを開けました。取手を取得しました', 'success');
        } else {
            showMessage('ロッカーは空です', 'info');
        }
    });

    document.getElementById('locker-door-locked').addEventListener('click', (e) => {
        e.stopPropagation();
        if (gameState.locker.lockedOpened) {
            showMessage('ロッカーは空です', 'info');
        } else if (gameState.inventory.includes('ロッカーの鍵')) {
            showModalDialog('ロッカーを開ける', 'ロッカーの鍵を使って開けますか？', [
                {
                    text: 'はい',
                    action: () => {
                        gameState.locker.lockedOpened = true;
                        document.getElementById('locker-door-locked').classList.add('opened');
                        addToInventory('モップ');
                        showMessage('ロッカーを開けました。モップを取得しました', 'success');
                        closeModal();
                    }
                },
                {
                    text: 'いいえ',
                    action: closeModal
                }
            ]);
        } else {
            showMessage('鍵が掛かっています', 'info');
        }
    });
}

// Hidden Safe (Back View)
function initializeHiddenSafe() {
    const switches = document.querySelectorAll('.switch');
    switches.forEach((switchEl, index) => {
        const upBtn = switchEl.querySelector('.switch-up');
        const downBtn = switchEl.querySelector('.switch-down');
        const stateEl = switchEl.querySelector('.switch-state');

        upBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            gameState.switches[index] = 'U';
            stateEl.textContent = '↑';
        });

        downBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            gameState.switches[index] = 'D';
            stateEl.textContent = '↓';
        });
    });

    document.getElementById('safe-enter-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const pattern = gameState.switches.join('');
        if (pattern === gameData.hiddenSafeCode) {
            if (!gameState.hiddenSafeOpened) {
                gameState.hiddenSafeOpened = true;
                addToInventory('カードキー');
                showMessage('隠し金庫が開きました！カードキーを取得しました', 'success');
                // Update lock panel if already activated
                if (gameState.lockPanel.activated && !gameState.lockPanel.cardInserted) {
                    document.getElementById('insert-card-btn').classList.remove('hidden');
                }
            } else {
                showMessage('隠し金庫は空です', 'info');
            }
        } else {
            showMessage('パターンが違います', 'error');
        }
    });
}

// Portable Safe Modal
function showPortableSafeModal() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>手提げ金庫</h2>
        <p>３桁の数字でロックを解除してください</p>
        <input type="text" id="safe-code-input" class="modal-input" maxlength="3" placeholder="3桁の数字">
        <button class="modal-button" id="safe-code-submit">解除</button>
    `;
    showModal();

    document.getElementById('safe-code-submit').addEventListener('click', () => {
        const code = document.getElementById('safe-code-input').value;
        if (code === gameData.portableSafeCode) {
            gameState.portableSafeOpened = true;
            addToInventory('メモ右半分');
            closeModal();
            showMessage('手提げ金庫が開きました！メモの右半分を取得しました', 'success');
            setTimeout(() => {
                showModalDialog('メモ右半分', '2231<br>ごさゅうい<br>んきち');
            }, 500);
            // Check if both memos are collected
            checkMemoCombination();
        } else {
            showMessage('パスワードが違います', 'error');
        }
    });
}

// Drawer Lock Modal
function showDrawerLockModal() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>南京錠付き引き出し</h2>
        <p>３桁の数字でロックを解除してください</p>
        <input type="text" id="drawer-code-input" class="modal-input" maxlength="3" placeholder="3桁の数字">
        <button class="modal-button" id="drawer-code-submit">解除</button>
    `;
    showModal();

    document.getElementById('drawer-code-submit').addEventListener('click', () => {
        const code = document.getElementById('drawer-code-input').value;
        if (code === gameData.drawerLockCode) {
            gameState.drawers.lockedOpened = true;
            document.getElementById('drawer-with-lock').classList.add('opened');
            addToInventory('メモ左半分');
            closeModal();
            showMessage('引き出しが開きました！メモの左半分を取得しました', 'success');
            setTimeout(() => {
                showModalDialog('メモ左半分', '1221<br>ぱーど<br>すわは');
            }, 500);
            // Check if both memos are collected
            checkMemoCombination();
        } else {
            showMessage('パスワードが違います', 'error');
        }
    });
}

// Check and combine memos
function checkMemoCombination() {
    if (gameState.inventory.includes('メモ左半分') && gameState.inventory.includes('メモ右半分')) {
        if (!gameState.memosCombined) {
            setTimeout(() => {
                showMemoDecodingModal();
            }, 1000);
        }
    }
}

// Memo Decoding Modal
function showMemoDecodingModal() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>メモを合体</h2>
        <p>２つのメモを合わせると...</p>
        <div style="background: #f5f5f5; padding: 20px; margin: 15px 0; border-radius: 5px;">
            <strong>12212231</strong><br>
            ぱーどごさゅうい<br>
            すわはんきち
        </div>
        <h3>暗号解読方法</h3>
        <p>1. 一番上の数字で奇数番目が上段、偶数番目が下段</p>
        <p>2. その数字で文章を分ける</p>
        <div style="background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 5px;">
            ぱ(1) / ーど(2) / ごさ(2) / ゅうい(3)<br>
            すわ(2) / は(1) / んき(2) / ち(1)
        </div>
        <p>3. 順番に繋げる</p>
        <div style="background: #c8e6c9; padding: 20px; margin: 15px 0; border-radius: 5px; font-size: 1.2em;">
            <strong>ぱすわーどはごさんきゅういち</strong><br>
            （パスワードは5391）
        </div>
        <button class="modal-button" id="understood-btn">理解しました</button>
    `;
    showModal();
    gameState.memosCombined = true;

    document.getElementById('understood-btn').addEventListener('click', () => {
        closeModal();
        showMessage('出口のロック解除パスワードは「5391」です！', 'success');
    });
}

// Inventory System
function addToInventory(item) {
    if (!gameState.inventory.includes(item)) {
        gameState.inventory.push(item);
        updateInventoryDisplay();
    }
}

function updateInventoryDisplay() {
    const inventoryContainer = document.getElementById('inventory-items');
    inventoryContainer.innerHTML = '';

    if (gameState.inventory.length === 0) {
        inventoryContainer.innerHTML = '<span style="color: #999;">アイテムなし</span>';
        return;
    }

    gameState.inventory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.textContent = item;
        itemDiv.addEventListener('click', () => showItemInfo(item));
        inventoryContainer.appendChild(itemDiv);
    });
}

function showItemInfo(item) {
    let info = '';
    switch(item) {
        case 'カードキー':
            info = 'ロック解除パネルに使用できます';
            break;
        case 'ロッカーの鍵':
            info = '鍵付きロッカーを開けることができます';
            break;
        case 'エンピツ':
            info = '白紙のメモをこすることができます';
            break;
        case '取手':
            info = '取手なし引き出しに使用できます';
            break;
        case 'モップ':
            info = '壁の絵を落とすことができます';
            break;
        case 'メモ左半分':
            info = '1221<br>ぱーど<br>すわは';
            break;
        case 'メモ右半分':
            info = '2231<br>ごさゅうい<br>んきち';
            break;
        case 'こすり出したメモ（613）':
            info = '南京錠のパスワード：613';
            break;
        case 'UDUUUの紙':
            info = '「UDUUU」と書かれています<br><br>U=UP（上）、D=DOWN（下）<br>隠し金庫のスイッチのヒントです';
            break;
        default:
            info = item;
    }
    showModalDialog(item, info);
}

// Modal Functions
function initializeModal() {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function showModal() {
    document.getElementById('modal').classList.add('show');
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
    document.getElementById('modal').classList.add('hidden');
}

function showModalDialog(title, content, buttons = null) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2>${title}</h2>
        <p>${content}</p>
    `;

    if (buttons) {
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'modal-button';
            button.textContent = btn.text;
            button.addEventListener('click', btn.action);
            modalBody.appendChild(button);
        });
    } else {
        const button = document.createElement('button');
        button.className = 'modal-button';
        button.textContent = 'OK';
        button.addEventListener('click', closeModal);
        modalBody.appendChild(button);
    }

    showModal();
}

// Message Functions
function showMessage(message, type = 'info') {
    let title = '';
    let icon = '';

    if (type === 'error') {
        title = 'エラー';
        icon = '❌';
    } else if (type === 'success') {
        title = '成功';
        icon = '✅';
    } else {
        title = 'お知らせ';
        icon = 'ℹ️';
    }

    showModalDialog(`${icon} ${title}`, message);
}
