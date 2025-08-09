<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>고양이 통합 마취 대시보드 v3.0 (기능 개선) - 금호동물병원</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Noto Sans KR', sans-serif; background-color: #f0f4f8; }
        .card { background-color: white; border-radius: 0.75rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 1.5rem; }
        .input-field { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1.5rem; text-align: center; font-weight: 700; }
        .select-field { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-weight: 600; }
        .step-card { border-left: 4px solid #4f46e5; background-color: #eef2ff; }
        .warning-card { border-left: 4px solid #f97316; background-color: #fff7ed; }
        .emergency-card { border-left: 4px solid #ef4444; background-color: #fee2e2; }
        .result-value { font-weight: 700; color: #4338ca; }
        .section-title { font-size: 1.5rem; font-weight: 700; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; }
        .tab-button { padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.3s; font-size: 0.9rem; sm:font-size: 1rem;}
        .tab-button.active { color: #4f46e5; border-bottom-color: #4f46e5; }
        .tab-content { display: none; animation: fadeIn 0.5s; }
        .tab-content.active { display: block; }
        .info-box { background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; color: #4b5563; }
        .result-box { padding: 1.5rem; margin-top: 1.5rem; border-radius: 0.5rem; text-align: center; }
        .result-box-weight { background-color: #e0f2fe; border-left: 5px solid #0ea5e9; }
        .result-box-trachea { background-color: #dcfce7; border-left: 5px solid #22c55e; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media print {
            .no-print { display: none; }
            #captureArea, #prepTab { box-shadow: none !important; border: none !important; }
            body { -webkit-print-color-adjust: exact; color-adjust: exact; background-color: #fff; }
            #captureArea input[type="text"], #captureArea input[type="date"], #captureArea input[type="time"] {
                border: none !important; background-color: transparent !important; padding: 0.5rem 0 !important; font-size: 1rem; color: #000;
            }
            #captureArea #removalInfo { border: 2px solid #facc15 !important; }
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
            cursor: pointer; filter: invert(0.5) sepia(1) saturate(5) hue-rotate(200deg);
        }
    </style>
</head>
<body class="p-4 md:p-6">

    <div class="max-w-7xl mx-auto">
        <header class="text-center mb-6">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800">고양이 통합 마취 대시보드 v3.0</h1>
            <p class="mt-2 text-lg text-gray-600">금호동물병원 실전 워크플로우 (Anes AI)</p>
        </header>

        <div class="card p-6 md:p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-center">
                <div>
                    <label for="weight" class="block text-center text-xl font-semibold text-gray-700 mb-2">환자 체중 (kg)</label>
                    <input type="number" id="weight" placeholder="체중 입력" class="input-field" oninput="calculateAll()">
                </div>
                <div>
                    <label for="patient_status" class="block text-center text-xl font-semibold text-gray-700 mb-2">환자 상태</label>
                    <select id="patient_status" class="w-full p-4 text-center text-lg select-field" onchange="calculateAll()">
                        <option value="healthy" selected>건강한 환자</option>
                        <option value="cardiac">심장 질환 의심</option>
                    </select>
                </div>
                 <div>
                    <label for="renal_status" class="block text-center text-xl font-semibold text-gray-700 mb-2">신기능 상태</label>
                    <select id="renal_status" class="w-full p-4 text-center text-lg select-field" onchange="calculateAll()">
                        <option value="healthy" selected>PLAN A: 건강</option>
                        <option value="renal">PLAN B: 신부전/의심</option>
                    </select>
                </div>
                 <div>
                    <label for="chill_protocol" class="block text-center text-xl font-semibold text-gray-700 mb-2">환자 유형</label>
                    <select id="chill_protocol" class="w-full p-4 text-center text-lg select-field" onchange="calculateAll()">
                        <option value="no" selected>표준 환자</option>
                        <option value="yes">Chill 프로토콜</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="card p-2 mb-6">
            <div class="flex flex-wrap justify-around border-b border-gray-200">
                <button class="tab-button active" onclick="openTab(event, 'prepTab')"><i class="fas fa-pills mr-2"></i>마취 준비</button>
                <button class="tab-button" onclick="openTab(event, 'etTubeTab')"><i class="fa-solid fa-staff-snake mr-2"></i>ET Tube</button>
                <button class="tab-button" onclick="openTab(event, 'emergencyTab')"><i class="fas fa-heart-pulse mr-2"></i>응급상황 대처</button>
                <button class="tab-button" onclick="openTab(event, 'dischargeTab')"><i class="fas fa-file-prescription mr-2"></i>퇴원약 조제</button>
                <button class="tab-button" onclick="openTab(event, 'norspanProtocolTab')"><i class="fas fa-book-medical mr-2"></i>노스판 프로토콜</button>
                <button class="tab-button" onclick="openTab(event, 'norspanHandoutTab')"><i class="fas fa-user-graduate mr-2"></i>노스판 안내문</button>
            </div>
        </div>

        <div id="prepTab" class="tab-content active">
            <div class="no-print p-4 mb-4 bg-gray-100 rounded-lg flex justify-center">
                <button onclick="exportCatPrepSheetAsImage()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center">
                    <i class="fas fa-camera mr-2"></i> 마취 준비 시트 이미지로 저장
                </button>
            </div>

            <div class="card p-6 md:p-8">
                 <h2 class="section-title">최종 선택 ET Tube</h2>
                <div id="cat_et_tube_selection_display" class="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg mb-6 text-center">
                    <p class="text-gray-700">ET Tube가 아직 선택되지 않았습니다. 'ET Tube' 탭에서 기록해주세요.</p>
                </div>

                <h2 class="section-title">수술 전 약물 준비</h2>
                <div class="info-box mb-4"><p><strong>목표:</strong> 마취에 필요한 모든 주사 약물과 수액, 패치를 미리 정확한 용량으로 준비하여, 마취 과정 중 실수를 방지하고 신속하게 대처합니다.</p></div>
                <div id="pre_op_drugs_result_cat" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">...</div>
            </div>
            <div id="chill_protocol_info_card" class="card p-6 md:p-8" style="display: none;">
                <h2 class="section-title">Chill Protocol 적용 안내</h2>
                <div class="info-box"><p><strong>목표:</strong> 병원 방문 자체에 극심한 스트레스를 받는 고양이를 위해, 내원 전 가정에서 미리 약물을 복용시켜 불안을 줄여주는 프로그램입니다.</p></div>
                <div id="chill_protocol_content" class="text-gray-700 space-y-4 mt-4">...</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="card p-6 md:p-8">
                    <h2 class="section-title">국소마취 (너브 블락)</h2>
                    <div id="nerve_block_result_cat" class="space-y-4">...</div>
                </div>
                <div class="card p-6 md:p-8">
                    <h2 class="section-title">케타민 CRI</h2>
                    <div id="ketamine_cri_result_cat">...</div>
                </div>
            </div>
            <div class="card p-6 md:p-8">
                <h2 class="section-title">마취 워크플로우</h2>
                <div id="workflow_steps_cat" class="space-y-4">...</div>
            </div>
            <div class="no-print p-4 mt-6 bg-gray-100 rounded-lg flex justify-center">
                 <button onclick="exportCatPrepSheetAsImage()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center">
                    <i class="fas fa-camera mr-2"></i> 마취 준비 시트 이미지로 저장
                </button>
            </div>
        </div>

        <div id="etTubeTab" class="tab-content">
             <div class="card p-6 md:p-8">
                <h2 class="section-title">최종 선택 ET Tube 기록</h2>
                 <div class="bg-gray-100 p-4 rounded-lg mb-8 border border-gray-300">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label for="cat_selectedEtTubeSize" class="block text-sm font-bold text-gray-700 mb-1">✔️ 최종 사이즈 (ID)</label>
                            <input type="number" id="cat_selectedEtTubeSize" step="0.5" placeholder="예: 4.0" class="w-full p-2 border border-gray-300 rounded-md text-lg text-center font-semibold">
                        </div>
                        <div class="flex flex-col justify-center">
                             <label for="cat_selectedEtTubeCuff" class="flex items-center cursor-pointer mb-2">
                                <input type="checkbox" id="cat_selectedEtTubeCuff" class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="ml-2 font-semibold text-gray-700">커프(Cuff) 확인 완료</span>
                            </label>
                            <label for="cat_selectedEtTubeNotes" class="block text-sm font-bold text-gray-700 mb-1">📝 메모</label>
                            <input type="text" id="cat_selectedEtTubeNotes" placeholder="예: 커프 약간 샘" class="w-full p-2 border border-gray-300 rounded-md">
                        </div>
                        <button id="saveCatEtTubeSelection" class="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 transition-colors h-full">
                            <i class="fas fa-save mr-2"></i>기록 저장
                        </button>
                    </div>
                </div>

                <h2 class="section-title">ET Tube 사이즈 통합 계산기</h2>
                 <div class="grid md:grid-cols-2 gap-8">
                    <div class="flex flex-col gap-8">
                        <div class="bg-white p-6 rounded-xl shadow-lg h-full border">
                            <h3 class="text-xl font-bold mb-4 text-gray-800">1. 체중으로 계산</h3>
                            <div class="flex flex-col sm:flex-row gap-4">
                                <div class="flex-grow">
                                    <label for="weight-input" class="sr-only">체중 (kg)</label>
                                    <input type="number" id="weight-input" placeholder="체중(kg) 입력" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-sky-500" step="0.1" oninput="calculateWeightSize()">
                                </div>
                                <button id="calculate-weight-btn" class="bg-sky-600 text-white font-bold px-6 py-3 rounded-lg text-lg hover:bg-sky-700 transition-colors" style="display:none;">확인</button>
                            </div>
                            <div id="result-container-weight" class="hidden">
                                <div class="result-box result-box-weight">
                                    <p class="text-lg text-sky-800">권장 사이즈</p>
                                    <p id="result-text-weight" class="text-5xl font-extrabold text-sky-700 my-2"></p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-lg border">
                            <h3 class="text-xl font-bold mb-4 text-center text-gray-800">체중별 사이즈 가이드 (고양이)</h3>
                            <div class="overflow-x-auto">
                                <table class="w-full text-center text-xs sm:text-sm">
                                    <thead class="bg-gray-200"><tr><th class="px-2 py-2">~2.5kg</th><th class="px-2 py-2">2.5-4kg</th><th class="px-2 py-2">4-5.5kg</th><th class="px-2 py-2">5.5kg+</th></tr></thead>
                                    <tbody class="divide-x divide-gray-200 bg-white"><tr class="font-bold text-base sm:text-lg"><td class="px-2 py-3">3.0</td><td class="px-2 py-3">3.5</td><td class="px-2 py-3">4.0</td><td class="px-2 py-3">4.5</td></tr></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-8">
                        <div class="bg-white p-6 rounded-xl shadow-lg h-full border">
                            <h3 class="text-xl font-bold mb-4 text-gray-800">2. 기관 직경으로 계산 (T1 X-ray)</h3>
                            <div class="flex flex-col sm:flex-row gap-4">
                                <div class="flex-grow">
                                    <label for="trachea-input" class="sr-only">기관 직경 (mm)</label>
                                    <input type="number" id="trachea-input" placeholder="기관 직경(mm) 입력" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500" step="0.01">
                                </div>
                                <button id="calculate-trachea-btn" class="bg-green-600 text-white font-bold px-6 py-3 rounded-lg text-lg hover:bg-green-700 transition-colors">확인</button>
                            </div>
                            <div id="result-container-trachea" class="hidden">
                                <div class="result-box result-box-trachea">
                                    <p class="text-lg text-green-800">권장 사이즈 (ID)</p>
                                    <p id="result-text-trachea" class="text-5xl font-extrabold text-green-700 my-2"></p>
                                </div>
                            </div>
                        </div>
                         <div class="bg-white p-6 rounded-xl shadow-lg border">
                            <h3 class="text-xl font-bold mb-4 text-center text-gray-800">기관 직경별 사이즈 가이드</h3>
                             <div class="overflow-x-auto"><table class="w-full text-center text-sm"><thead class="bg-gray-200"><tr><th class="px-3 py-2">기관 직경(mm)</th><th class="px-3 py-2">ET Tube ID</th></tr></thead><tbody class="divide-y divide-gray-200"><tr><td class="px-3 py-2">~ 5.13</td><td class="px-3 py-2 font-bold">2.5</td></tr><tr><td class="px-3 py-2">~ 5.88</td><td class="px-3 py-2 font-bold">3.0</td></tr><tr><td class="px-3 py-2">~ 6.63</td><td class="px-3 py-2 font-bold">3.5</td></tr><tr><td class="px-3 py-2">~ 7.50</td><td class="px-3 py-2 font-bold">4.0</td></tr><tr><td class="px-3 py-2">~ 8.13</td><td class="px-3 py-2 font-bold">4.5</td></tr></tbody></table></div>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <p class="text-yellow-800 font-semibold">※ 이 결과는 일반적인 가이드이며, 실제 적용 시에는 환자의 품종, 체형, 기도 상태 등을 종합적으로 고려해야 합니다.</p>
                </div>
            </div>
        </div>
        
        <div id="emergencyTab" class="tab-content">
            <div class="card p-6 md:p-8">
                <h2 class="section-title text-red-600"><i class="fas fa-triangle-exclamation mr-2"></i>마취 중 문제 해결 (고양이)</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="emergency-card p-4">
                        <h3 class="font-bold text-lg text-red-800">저혈압 & 서맥</h3>
                        <div id="hypotension_protocol_cat">...</div>
                        <div id="bradycardia_protocol_cat" class="mt-4">...</div>
                    </div>
                    <div class="emergency-card p-4">
                        <h3 class="font-bold text-lg text-red-800">심정지 (CPA) 프로토콜 (RECOVER 기반)</h3>
                        <div id="cpa_protocol_cat">...</div>
                    </div>
                </div>
            </div>
        </div>

        <div id="dischargeTab" class="tab-content">
             <div class="card p-6 md:p-8">
                <h2 class="section-title">수술 후 퇴원약 조제</h2>
                <div class="info-box mb-4"><p><strong>목표:</strong> 환자가 집으로 돌아간 후에도 통증 없이 편안하게 회복할 수 있도록, 환자 상태에 맞는 최적의 약물을 정확한 용량으로 조제합니다.</p></div>
                <div class="flex items-center gap-4 mb-4 max-w-md">
                    <label for="prescription_days_cat" class="font-semibold text-gray-700 whitespace-nowrap">총 처방일수:</label>
                    <input type="number" id="prescription_days_cat" value="7" class="input-field !text-lg !p-2" oninput="calculateAll()">
                </div>
                <div id="discharge_cat" class="grid md:grid-cols-2 gap-6">...</div>
            </div>
        </div>

        <div id="norspanProtocolTab" class="tab-content">
             <div class="card p-6 md:p-8">
                <h2 class="section-title">노스판 패치 임상 프로토콜</h2>
                <div id="norspan_protocol_content" class="text-sm text-gray-700 space-y-4">...</div>
            </div>
        </div>

        <div id="norspanHandoutTab" class="tab-content">
            <div class="card p-6 md:p-8">
                <h2 class="section-title">보호자 안내문 생성</h2>
                <div id="norspan_handout_generator">
                    <div class="no-print bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row gap-3 justify-center">
                        <button onclick="saveAsPDF()" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"><i class="fas fa-print mr-2"></i> 인쇄 또는 PDF로 저장</button>
                        <button onclick="saveAsImage('captureArea', '_통증패치_안내문')" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"><i class="fas fa-image mr-2"></i> 이미지(PNG)로 저장</button>
                    </div>
                    <div id="captureArea" class="bg-white rounded-xl shadow-lg p-6 sm:p-10 border border-gray-200">
                        <header class="text-center mb-10"><h1 class="text-3xl md:text-4xl font-bold text-blue-800">금호동물병원</h1><h2 class="text-xl md:text-2xl font-semibold text-gray-700 mt-3">우리 아이를 위한 통증 관리 패치 안내문</h2></header>
                        <div class="border-y border-gray-200 py-5 mb-10 space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="flex items-center"><label for="patientName" class="font-semibold text-gray-600 mr-3 w-24 text-right">환자 이름:</label><input type="text" id="patientName" name="patientName" placeholder="아이 이름 입력" class="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-300"></div></div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="flex items-center"><label for="attachDate" class="font-semibold text-gray-600 mr-3 w-24 text-right">부착 날짜:</label><input type="date" id="attachDate" name="attachDate" onchange="calculateRemovalDate()" class="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-300 cursor-pointer"></div><div class="flex items-center"><label for="attachTime" class="font-semibold text-gray-600 mr-3 w-24 text-right">부착 시간:</label><input type="time" id="attachTime" name="attachTime" onchange="calculateRemovalDate()" class="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-300 cursor-pointer"></div></div>
                            <div id="removalInfo" class="mt-4 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-center transition-all duration-300"><p class="font-bold text-yellow-900">날짜와 시간을 입력하면 제거일이 계산됩니다.</p></div>
                        </div>
                        <p class="text-gray-700 text-base md:text-lg mb-10 text-center leading-relaxed">사랑하는 보호자님, 저희 병원을 믿고 소중한 아이를 맡겨주셔서 감사합니다.<br>우리 아이가 수술 후 통증 없이 편안하게 회복할 수 있도록, **'부프레노르핀'이라는 성분의 진통 패치**를 부착했습니다.<br>아래 내용을 잘 읽어보시고, 아이가 잘 회복할 수 있도록 함께 보살펴 주세요.</p>
                        <div class="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-md mb-10"><h3 class="text-xl font-bold text-blue-900 mb-2">✅ 이 패치는 어떤 역할을 하나요?</h3><ul class="list-disc list-inside text-gray-700 space-y-1 text-base"><li>약 3~4일 동안 진통제가 서서히 방출되어, 아이가 통증 없이 편안하게 지낼 수 있도록 돕는 **'지속형 진통 패치'**입니다.</li><li>잦은 주사나 약 복용의 스트레스를 줄여주는 장점이 있습니다.</li></ul></div>
                        <div class="mb-10"><h3 class="text-2xl font-bold text-gray-800 text-center mb-4">👀 우리 아이, 이렇게 관찰해주세요!</h3><p class="text-center text-gray-500 mb-6">아이의 행동 변화는 약효가 잘 나타나고 있다는 긍정적인 신호일 수 있습니다. 너무 걱정하지 마세요!</p><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="bg-green-50 rounded-lg p-5 border border-green-200"><h4 class="text-xl font-bold text-green-800 flex items-center mb-3"><i class="fas fa-check-circle mr-2"></i>이런 모습은 괜찮아요</h4><ul class="list-disc list-inside space-y-3 text-gray-700"><li><strong>잠이 늘거나 얌전해져요.</strong><br><span class="text-sm text-gray-500">몸이 편안하고 통증이 줄었다는 신호일 수 있습니다.</span></li><li><strong>평소보다 말이 많아지거나, 몸을 많이 비벼요.</strong><br><span class="text-sm text-gray-500">일부 고양이의 정상적인 약물 반응으로 보통 1~2일 내 사라져요.</span></li><li><strong>눈동자가 평소보다 커져 보여요.</strong><br><span class="text-sm text-gray-500">진통제의 일반적인 효과 중 하나입니다.</span></li><li><strong>식욕이 약간 줄어들어요.</strong><br><span class="text-sm text-gray-500">일시적일 수 있으니, 물을 잘 마시는지 확인해주세요.</span></li></ul></div><div class="bg-red-50 rounded-lg p-5 border border-red-200"><h4 class="text-xl font-bold text-red-800 flex items-center mb-3"><i class="fas fa-exclamation-triangle mr-2"></i>이런 모습은 바로 연락주세요</h4><ul class="list-disc list-inside space-y-3 text-gray-700"><li><strong>숨을 헐떡이거나 힘겹게 쉬어요.</strong><br><span class="text-sm text-gray-500">호흡이 분당 40회 이상으로 지속될 때</span></li><li><strong>몸을 전혀 움직이지 못하고 축 늘어져요.</strong><br><span class="text-sm text-gray-500">이름을 불러도 반응이 거의 없을 때</span></li><li><strong>구토나 설사를 3회 이상 반복해요.</strong><br><span class="text-sm text-gray-500">탈수나 다른 문제의 신호일 수 있습니다.</span></li><li><strong>패치가 떨어졌거나, 아이가 핥거나 씹고 있어요.</strong><br><span class="text-sm text-gray-500">과용량 위험이 있으니 즉시 연락주세요.</span></li></ul></div></div></div>
                        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-md mb-10"><h3 class="text-xl font-bold text-yellow-900 mb-3">🔥 보호자님, 이것만은 꼭! 지켜주세요</h3><ol class="list-decimal list-inside text-gray-700 space-y-3"><li><strong>가장 중요! 열 주의 🔥</strong><br><strong>전기장판, 핫팩, 온열 램프, 드라이기 등</strong> 패치 부위에 열이 가해지지 않도록 **절대적으로** 주의해주세요. 약물이 과다 흡수되어 위험할 수 있습니다.</li><li><strong>패치 보호</strong><br>아이가 패치를 핥거나, 긁거나, 떼어내지 않도록 지켜봐 주세요. 필요 시 넥카라나 환자복을 착용시켜 주세요.</li><li><strong>안전한 환경</strong><br>다른 반려동물이나 어린이가 패치를 만지거나 핥지 않도록 주의해주세요.</li><li><strong>안전한 폐기</strong><br>패치를 제거할 때는 접착면끼리 마주 보게 반으로 접어, 아이의 손이 닿지 않는 곳에 안전하게 버려주세요.</li></ol></div>
                        <footer class="border-t border-gray-200 pt-8 text-center"><h3 class="text-xl font-semibold text-gray-800">궁금하거나 걱정되는 점이 있다면?</h3><p class="text-gray-600 mt-2">사소한 걱정이라도 괜찮으니, 주저 말고 아래 연락처로 문의해 주세요.</p><div class="mt-4 bg-gray-50 rounded-lg p-4 inline-block"><p class="font-bold text-lg text-blue-800">금호동물병원</p><p class="text-gray-700 mt-1">📞 <a href="tel:062-383-7572" class="hover:underline">062-383-7572</a></p><div class="text-sm text-gray-500 mt-2"><p>평일: 오전 9시 30분 ~ 오후 6시</p><p>토요일: 오전 9시 30분 ~ 오후 3시</p><p>일요일: 휴무</p></div><a href="https://pf.kakao.com/_jiICK/chat" target="_blank" class="mt-4 inline-block w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"><i class="fas fa-comment mr-2"></i> 카카오톡 문의</a></div><p class="text-xs text-gray-400 mt-8">저희는 항상 아이가 편안하게 회복할 수 있도록 곁에서 최선을 다하겠습니다.</p></footer>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const concentrations_cat = {
            butorphanol: 10, midazolam: 5, propofol: 10, alfaxalone: 10, ketamine: 50, ketamine_diluted: 10, bupivacaine: 5, lidocaine: 20,
            meloxicam_inj: 2, atropine: 0.5, norepinephrine_raw: 1, epinephrine: 1, vasopressin: 20, meloxicam_oral: 0.5, dexmedetomidine: 0.5
        };
        const pillStrengths_cat = { gabapentin: 100, amoxicillin_capsule: 250, famotidine: 10 };
        let selectedCatTubeInfo = { size: null, cuff: false, notes: '' };

        function openTab(evt, tabName) {
            let i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";
            tablinks = document.getElementsByClassName("tab-button");
            for (i = 0; i < tablinks.length; i++) tablinks[i].className = tablinks[i].className.replace(" active", "");
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }

        function calculateAll() {
            updateCatTubeDisplay();
            const weightInput = document.getElementById('weight');
            if (!weightInput.value) {
                const weightInputTube = document.getElementById('weight-input');
                if (weightInputTube) {
                    weightInputTube.value = '';
                    calculateWeightSize();
                }
                return;
            }
            const weight = parseFloat(weightInput.value);
            if (isNaN(weight) || weight <= 0) return;
            
            const weightInputTube = document.getElementById('weight-input');
            if(weightInputTube) {
                weightInputTube.value = weight;
                calculateWeightSize();
            }

            populatePrepTab(weight);
            populateEmergencyTab(weight);
            populateDischargeTab(weight);
            populateNorspanProtocol(weight);
        }

        function populatePrepTab(weight) {
            const status = document.getElementById('patient_status').value;
            const isChill = document.getElementById('chill_protocol').value === 'yes';
            const premedFactor = isChill ? 0.5 : 1.0;
            const inductionFactor = isChill ? 0.5 : 1.0;

            const butorMl = (0.2 * weight * premedFactor) / concentrations_cat.butorphanol;
            const midaMl = (0.2 * weight * premedFactor) / concentrations_cat.midazolam;
            const ketaLoadMl = (0.5 * weight) / concentrations_cat.ketamine_diluted;
            const alfaxanMlMin = (1 * weight * inductionFactor) / concentrations_cat.alfaxalone;
            const alfaxanMlMax = (2 * weight * inductionFactor) / concentrations_cat.alfaxalone;
            const pumpCorrectionFactor = 0.7;
            const fluidRate = status === 'healthy' ? 3 : 1.5;
            const fluidTarget = fluidRate * weight;
            const fluidCorrected = fluidTarget / pumpCorrectionFactor;
            
            let patchRecommendation = "";
            if (weight <= 3.0) { patchRecommendation = "5 mcg/h 1매"; } 
            else if (weight <= 6.0) { patchRecommendation = "10 mcg/h 1매"; } 
            else { patchRecommendation = "20 mcg/h 1매"; }

            const norepiRate = (((weight * 0.1 * 60) / 1000) / (0.3 * 1 / 30));
            const epiLowMl = (0.01 * weight) / (concentrations_cat.epinephrine / 10);
            const atropineCpaMl = (0.04 * weight) / concentrations_cat.atropine;

            document.getElementById('pre_op_drugs_result_cat').innerHTML = `
                <div class="p-3 bg-blue-50 rounded-lg"><h4 class="font-bold text-blue-800">마취 전 투약</h4><p><span class="result-value">${butorMl.toFixed(2)} mL</span> 부토르파놀</p><p><span class="result-value">${midaMl.toFixed(2)} mL</span> 미다졸람</p>${isChill ? '<p class="text-xs text-red-600 font-bold mt-1">※ Chill 50% 감량</p>' : ''}</div>
                <div class="p-3 bg-amber-50 rounded-lg"><h4 class="font-bold text-amber-800">케타민 부하</h4><p><span class="result-value">${ketaLoadMl.toFixed(2)} mL</span> (희석액)</p><p class="text-xs text-gray-600 font-semibold mt-1">※ 희석: 케타민(50주) 0.2mL + N/S 0.8mL</p></div>
                <div class="p-3 bg-indigo-50 rounded-lg"><h4 class="font-bold text-indigo-800">마취 유도제</h4><p><span class="result-value">${alfaxanMlMin.toFixed(2)}~${alfaxanMlMax.toFixed(2)} mL</span> 알팍산</p>${isChill ? '<p class="text-xs text-red-600 font-bold mt-1">※ Chill 50% 감량</p>' : ''}</div>
                <div class="p-3 bg-cyan-50 rounded-lg"><h4 class="font-bold text-cyan-800">수액 펌프</h4><p><span class="result-value">${fluidCorrected.toFixed(1)} mL/hr</span></p><p class="text-xs text-gray-500 mt-1">(목표: ${fluidTarget.toFixed(1)}mL/hr)</p></div>
                <div class="p-3 bg-fuchsia-50 rounded-lg"><h4 class="font-bold text-fuchsia-800">노스판 패치</h4><p class="result-value">${patchRecommendation}</p></div>
                <div class="p-3 bg-red-50 rounded-lg col-span-full md:col-span-1"><h4 class="font-bold text-red-800">응급 약물 준비</h4>
                    <p class="text-xs text-left">노르에피(CRI희석액): <span class="result-value">${(norepiRate / 60).toFixed(2)} mL</span>/min</p>
                    <p class="text-xs text-left">에피(저용량,희석액): <span class="result-value">${epiLowMl.toFixed(2)} mL</span></p>
                    <p class="text-xs text-left">아트로핀: <span class="result-value">${atropineCpaMl.toFixed(2)} mL</span></p>
                </div>`;

            const chillCard = document.getElementById('chill_protocol_info_card');
            if (isChill) {
                chillCard.style.display = 'block';
                document.getElementById('chill_protocol_content').innerHTML = `<div class="p-4 border rounded-lg bg-gray-50 space-y-3"><div><h4 class="font-bold text-gray-800">1. 사전 처방</h4><p><strong>가바펜틴 100mg 캡슐</strong>을 처방하여, 보호자가 병원 방문 1~2시간 전 가정에서 경구 투여하도록 안내합니다.</p></div><div><h4 class="font-bold text-gray-800">2. 원내 프로토콜</h4><p>가바펜틴을 복용한 환자는 <strong class="text-red-600">마취 전 투약 및 유도제 용량이 자동으로 50% 감량</strong>됩니다.</p></div></div>`;
            } else {
                chillCard.style.display = 'none';
            }

            const sites = parseInt(document.getElementById('cat_block_sites')?.value) || 4;
            let vol_per_site = Math.min(0.3, Math.max(0.1, 0.08 * weight));
            let total_vol_needed = vol_per_site * sites;
            const final_total_ml = Math.min((1.0 * weight / 5 * 1.25), total_vol_needed);
            document.getElementById('nerve_block_result_cat').innerHTML = `<div class="flex items-center gap-4 mb-4"><label for="cat_block_sites" class="font-semibold text-gray-700">마취 부위 수:</label><select id="cat_block_sites" class="select-field" onchange="calculateAll()"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4" selected>4</option></select></div><div class="p-2 border rounded-lg bg-gray-50"><h4 class="font-semibold text-gray-800">총 준비 용량 (${sites}군데)</h4><p class="text-xs text-red-600 font-bold">부피바케인 총량 1.0mg/kg 초과 금지!</p><p><span class="result-value">${(final_total_ml*0.8).toFixed(2)}mL</span> (0.5% 부피) + <span class="result-value">${(final_total_ml*0.2).toFixed(2)}mL</span> (2% 리도)</p></div>`;
            document.getElementById('cat_block_sites').value = sites;

            const cri_rate_ml_hr = weight * 0.3;
            document.getElementById('ketamine_cri_result_cat').innerHTML = `<div class="p-4 border rounded-lg bg-gray-50"><h4 class="font-semibold text-gray-800">CRI 펌프 속도 설정</h4><p class="text-xs text-gray-600">희석: 케타민(50주) 0.6mL + N/S 29.4mL</p><p class="text-sm">목표: 5 mcg/kg/min (0.3 mg/kg/hr)</p><div class="mt-2 text-red-600 font-bold text-xl">${cri_rate_ml_hr.toFixed(2)} mL/hr</div></div>`;
            
            document.getElementById('workflow_steps_cat').innerHTML = `<div class="step-card p-4"><h3 class="font-bold text-lg text-indigo-800">Step 1: 내원 및 안정화</h3><p class="text-sm text-gray-700">IV 장착 후, 수액을 연결하고 입원장 내에서 산소를 공급하며 환자를 안정시킵니다. 필요 시 노스판 패치를 미리 부착합니다.</p></div><div class="step-card p-4"><h3 class="font-bold text-lg text-indigo-800">Step 2: 마취 전 투약</h3><p class="text-sm text-gray-700">산소를 공급하며, 준비된 부토르파놀+미다졸람을 2분에 걸쳐 천천히 IV합니다.</p></div><div class="warning-card p-4"><h3 class="font-bold text-lg text-orange-800">Step 3: 마취 유도 및 케타민 로딩</h3><p class="text-sm text-gray-700">준비된 유도제를 효과를 봐가며 주사하여 삽관 후, 케타민 부하 용량을 1분에 걸쳐 천천히 IV합니다.</p></div><div class="step-card p-4"><h3 class="font-bold text-lg text-indigo-800">Step 4: 마취 유지</h3><p class="text-sm text-gray-700">호흡마취 및 케타민 CRI 펌프를 작동시키고, 모든 발치/수술 부위에 국소마취를 적용합니다.</p></div>`;
        }
        
        function populateEmergencyTab(weight) {
            const norepiDose = 0.1;
            const norepiRate = (((weight * norepiDose * 60) / 1000) / (0.3 * 1 / 30));
            document.getElementById('hypotension_protocol_cat').innerHTML = `<h4 class="font-bold text-lg text-red-800">저혈압 (SBP < 90)</h4><ol class="list-decimal list-inside mt-2 space-y-2 text-sm"><li>호흡 마취제 농도 감소</li><li><span class="text-red-600 font-bold">수액 볼루스 절대 금기!</span> 승압제 사용.</li></ol><div class="mt-2 p-2 rounded-lg bg-red-100"><h5 class="font-semibold text-center text-sm">노르에피네프린 CRI (1차)</h5><p class="text-xs text-center mb-1">희석: 원액 0.3mL + N/S 29.7mL</p><p class="text-center font-bold text-red-700 text-lg">${norepiRate.toFixed(2)} mL/hr <span class="text-sm font-normal">(0.1 mcg/kg/min)</span></p></div>`;
            document.getElementById('bradycardia_protocol_cat').innerHTML = `<h4 class="font-bold text-lg text-red-800 mt-4">서맥 (Bradycardia)</h4><div class="mt-2 p-2 rounded-lg bg-red-100"><p class="text-center text-red-700 font-bold">아트로핀 금기 (HCM 의심)</p><p class="text-center text-xs text-gray-600">마취 심도 조절 및 원인 교정 우선</p></div>`;
            const epiLowMl = (0.01 * weight) / (concentrations_cat.epinephrine / 10);
            const vasoMl = (0.8 * weight) / concentrations_cat.vasopressin;
            const atropineCpaMl = (0.04 * weight) / concentrations_cat.atropine;
            document.getElementById('cpa_protocol_cat').innerHTML = `<div class="info-box mb-2 text-xs"><p><strong>핵심 개념:</strong> BLS는 '엔진'을 계속 돌려주는 역할이고, ALS는 '엔진을 수리'하는 역할입니다. 고품질의 BLS 없이는 ALS가 성공할 수 없습니다.</p></div><h4 class="font-bold text-md text-gray-800 mt-3">1. BLS (기본소생술)</h4><ul class="list-disc list-inside text-sm space-y-1 mt-1"><li><strong>순환:</strong> 분당 100-120회 속도로 흉곽 1/3 깊이 압박 (2분마다 교대)</li><li><strong>기도확보:</strong> 즉시 기관 삽관</li><li><strong>호흡:</strong> 6초에 1회 인공 환기 (과환기 금지)</li></ul><h4 class="font-bold text-md text-gray-800 mt-3">2. ALS (전문소생술)</h4><div class="mt-2 p-2 rounded-lg bg-red-100 space-y-2"><h5 class="font-semibold text-sm">에피네프린 (Low dose)</h5><p class="text-xs text-center mb-1 font-semibold">희석: 원액 0.1mL + N/S 0.9mL</p><p class="text-center font-bold text-red-700">${epiLowMl.toFixed(2)} mL (희석액) IV</p><hr><h5 class="font-semibold text-sm">바소프레신 (대체 가능)</h5><p class="text-center font-bold text-red-700">${vasoMl.toFixed(2)} mL IV</p><hr><h5 class="font-semibold text-sm">아트로핀 (Vagal arrest 의심 시)</h5><p class="text-center font-bold text-red-700">${atropineCpaMl.toFixed(2)} mL IV</p></div>`;
        }

        function populateDischargeTab(weight) {
            const renalStatus = document.getElementById('renal_status').value;
            const generalDays = parseInt(document.getElementById('prescription_days_cat')?.value) || 7;
            const getPillCount = (mgPerDose, frequency, pillStrength, days) => { if (days <= 0) return "일수 입력"; const pillsPerDose = mgPerDose / pillStrength; const totalPills = Math.ceil(pillsPerDose * frequency * days * 2) / 2; return `<strong>${totalPills.toFixed(1).replace('.0','')}정</strong> (${pillStrength}mg/정) | 1회 ${pillsPerDose.toFixed(2)}정, ${frequency}회/일`; };
            let content = '';
            if (renalStatus === 'healthy') {
                const vetrocamDays = parseInt(document.getElementById('vetrocam_days_cat')?.value) || 3;
                let totalVetrocamDoseMl = 0;
                if (vetrocamDays >= 1) { totalVetrocamDoseMl += (0.1 * weight) / concentrations_cat.meloxicam_oral; if (vetrocamDays > 1) totalVetrocamDoseMl += (vetrocamDays - 1) * ((0.05 * weight) / concentrations_cat.meloxicam_oral); }
                const gabapentinDoseA = parseFloat(document.getElementById('gabapentin_dose_cat_a')?.value) || 5;
                content = `<div id="discharge_gold_cat"><h3 class="font-bold text-lg text-green-700 mb-2">시나리오 1: 종합 처방 (신기능 정상)</h3><div class="p-4 bg-green-50 rounded-lg space-y-2"><div><label class="font-semibold text-sm">베트로캄 처방일: <input type="number" id="vetrocam_days_cat" value="${vetrocamDays}" class="w-16 p-0.5 border rounded text-center" oninput="calculateAll()"></label></div><p><strong>베트로캄(액상, 1일 1회):</strong> 총 <span class="result-value">${totalVetrocamDoseMl.toFixed(2)} mL</span></p><hr><div><label class="font-semibold text-sm">가바펜틴 용량(mg/kg): <input type="number" id="gabapentin_dose_cat_a" value="${gabapentinDoseA}" class="w-16 p-0.5 border rounded text-center" oninput="calculateAll()"></label></div><div class="text-sm p-1 bg-green-100 rounded">${getPillCount(gabapentinDoseA * weight, 2, pillStrengths_cat.gabapentin, generalDays)}</div><hr><p class="font-semibold text-sm">항생제/위장보호제는 동일</p></div></div>`;
            } else {
                 const gabapentinDoseB = parseFloat(document.getElementById('gabapentin_dose_cat_b')?.value) || 10;
                 content = `<div id="discharge_alt_cat"><h3 class="font-bold text-lg text-orange-700 mb-2">시나리오 2: NSAID 제외 처방 (신기능 저하)</h3><div class="info-box mb-2 text-xs"><p class="font-bold text-red-600">NSAIDs 절대 금기!</p></div><div class="p-4 bg-orange-50 rounded-lg space-y-2"><div><label class="font-semibold text-sm">가바펜틴 용량(mg/kg): <input type="number" id="gabapentin_dose_cat_b" value="${gabapentinDoseB}" class="w-16 p-0.5 border rounded text-center" oninput="calculateAll()"></label></div><div class="text-sm p-1 bg-orange-100 rounded">${getPillCount(gabapentinDoseB * weight, 2, pillStrengths_cat.gabapentin, generalDays)}</div><hr><p class="font-semibold text-sm">항생제/위장보호제는 동일</p></div></div>`;
            }
            document.getElementById('discharge_cat').innerHTML = content;
        }

        function populateNorspanProtocol(weight) {
            let patchRecommendation = "";
            if (weight <= 3.0) { patchRecommendation = "5 mcg/h 1매"; } 
            else if (weight <= 6.0) { patchRecommendation = "10 mcg/h 1매"; } 
            else { patchRecommendation = "20 mcg/h 1매"; }
            document.getElementById('norspan_protocol_content').innerHTML = `<h4 class="font-bold text-gray-800 mb-2">1. 적용 대상 및 금기</h4><p><strong>적용:</strong> 고양이 수술 후 통증, 만성 통증(관절염, 종양), CKD 환자 통증 관리</p><p class="text-red-600"><strong>금기:</strong> 개, 급성 통증 단독 치료, 피부 질환 부위, 심각한 간부전</p><hr class="my-3"><h4 class="font-bold text-gray-800 mb-2">2. 용량 선택</h4><div class="p-2 bg-blue-50 rounded text-center font-bold text-blue-800">${weight.toFixed(1)}kg 환자 추천: ${patchRecommendation}</div><p class="text-red-600 font-bold text-sm mt-2">🚨 경고: 패치는 절대 자르지 마십시오!</p><hr class="my-3"><h4 class="font-bold text-gray-800 mb-2">3. 핵심 안전 수칙</h4><p class="text-red-600">🔥 패치 부착 환자에게 전기장판, 핫팩 등 모든 외부 열원 사용을 절대 금지해야 함을 보호자에게 반드시 교육!</p>`;
        }
        
        function calculateRemovalDate() {
            const dateInput = document.getElementById('attachDate').value;
            const timeInput = document.getElementById('attachTime').value;
            const removalInfoDiv = document.getElementById('removalInfo');
            if (!dateInput || !timeInput || !removalInfoDiv) { if(removalInfoDiv) removalInfoDiv.innerHTML = '<p class="font-bold text-yellow-900">날짜와 시간을 입력해주세요.</p>'; return; }
            const attachDateTime = new Date(`${dateInput}T${timeInput}`);
            if (isNaN(attachDateTime.getTime())) { removalInfoDiv.innerHTML = '<p class="font-bold text-red-700">유효한 날짜와 시간을 입력해주세요.</p>'; return; }
            const removalDateStart = new Date(attachDateTime.getTime() + 72 * 3600 * 1000);
            const removalDateEnd = new Date(attachDateTime.getTime() + 96 * 3600 * 1000);
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
            removalInfoDiv.innerHTML = `<h4 class="text-lg font-bold text-gray-800 mb-2">🗓️ 패치 제거 권장 기간</h4><p class="text-base text-gray-700"><strong class="text-blue-600">${new Intl.DateTimeFormat('ko-KR', options).format(removalDateStart)}</strong> 부터<br><strong class="text-blue-600">${new Intl.DateTimeFormat('ko-KR', options).format(removalDateEnd)}</strong> 사이에<br>패치를 제거해주세요.</p>`;
        }
        
        function saveAsPDF() { window.print(); }
        function saveAsImage(elementId, suffix) {
            const captureElement = document.getElementById(elementId);
            const patientName = document.getElementById('patientName')?.value || '환자';
            html2canvas(captureElement, { useCORS: true, scale: 2 }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${patientName}${suffix}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
        
        function exportCatPrepSheetAsImage() {
            const captureElement = document.getElementById('prepTab');
            const weight = document.getElementById('weight').value || '체중미입력';
            const patientName = document.getElementById('patientName').value || '환자';
            const filename = `[고양이]${patientName}_${weight}kg_마취준비시트.png`;
            html2canvas(captureElement, { useCORS: true, scale: 1.5, backgroundColor: '#f0f4f8' }).then(canvas => {
                const link = document.createElement('a');
                link.download = filename;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }

        const weightSizeGuideCat = [ { weight: 2.5, size: '3.0' }, { weight: 4, size: '3.5' }, { weight: 5.5, size: '4.0' }, { weight: 99, size: '4.5' } ];
        const tracheaSizeGuideCat = [ { diameter: 5.13, id: '2.5' }, { diameter: 5.88, id: '3.0' }, { diameter: 6.63, id: '3.5' }, { diameter: 7.50, id: '4.0' }, { diameter: 8.13, id: '4.5' }];

        function calculateWeightSize() {
            const weightInput = document.getElementById('weight-input');
            const resultContainerWeight = document.getElementById('result-container-weight');
            const resultTextWeight = document.getElementById('result-text-weight');
            const weight = parseFloat(weightInput.value);
            if (isNaN(weight) || weight <= 0) { resultContainerWeight.classList.add('hidden'); return; }
            let recommendedSize = '4.5 이상';
            for (let i = 0; i < weightSizeGuideCat.length; i++) { if (weight <= weightSizeGuideCat[i].weight) { recommendedSize = weightSizeGuideCat[i].size; break; } }
            resultTextWeight.textContent = recommendedSize;
            resultContainerWeight.classList.remove('hidden');
        }

        function calculateTracheaSize() {
            const tracheaInput = document.getElementById('trachea-input');
            const resultContainerTrachea = document.getElementById('result-container-trachea');
            const resultTextTrachea = document.getElementById('result-text-trachea');
            const diameter = parseFloat(tracheaInput.value);
            if (isNaN(diameter) || diameter <= 0) { resultContainerTrachea.classList.add('hidden'); return; }
            let recommendedId = '4.5 이상';
             for (let i = 0; i < tracheaSizeGuideCat.length; i++) { if (diameter <= tracheaSizeGuideCat[i].diameter) { recommendedId = tracheaSizeGuideCat[i].id; break; } }
            resultTextTrachea.textContent = recommendedId;
            resultContainerTrachea.classList.remove('hidden');
        }

        function saveCatEtTubeSelection() {
            const sizeInput = document.getElementById('cat_selectedEtTubeSize');
            if (!sizeInput.value) { alert('최종 ET Tube 사이즈를 입력해주세요.'); sizeInput.focus(); return; }
            selectedCatTubeInfo.size = parseFloat(sizeInput.value);
            selectedCatTubeInfo.cuff = document.getElementById('cat_selectedEtTubeCuff').checked;
            selectedCatTubeInfo.notes = document.getElementById('cat_selectedEtTubeNotes').value;
            const saveButton = document.getElementById('saveCatEtTubeSelection');
            saveButton.innerHTML = '<i class="fas fa-check-circle mr-2"></i>저장 완료!';
            saveButton.classList.replace('bg-blue-600', 'bg-green-600');
            setTimeout(() => {
                saveButton.innerHTML = '<i class="fas fa-save mr-2"></i>기록 저장';
                saveButton.classList.replace('bg-green-600', 'bg-blue-600');
            }, 2000);
            updateCatTubeDisplay();
        }

        function updateCatTubeDisplay() {
            const displayDiv = document.getElementById('cat_et_tube_selection_display');
            if (!displayDiv) return;
            if (selectedCatTubeInfo.size) {
                const cuffStatus = selectedCatTubeInfo.cuff ? '<span class="text-green-600 font-semibold"><i class="fas fa-check-circle mr-1"></i>확인 완료</span>' : '<span class="text-red-600 font-semibold"><i class="fas fa-times-circle mr-1"></i>미확인</span>';
                const notesText = selectedCatTubeInfo.notes ? `<p class="text-sm text-gray-600 mt-2"><strong>메모:</strong> ${selectedCatTubeInfo.notes}</p>` : '';
                displayDiv.innerHTML = `<div class="text-left grid grid-cols-1 sm:grid-cols-2 gap-x-4"><p class="text-lg"><strong>선택된 Tube 사이즈 (ID):</strong> <span class="result-value text-2xl">${selectedCatTubeInfo.size}</span></p><p class="text-lg"><strong>커프(Cuff) 확인:</strong> ${cuffStatus}</p></div>${notesText}`;
            } else {
                displayDiv.innerHTML = '<p class="text-gray-700">ET Tube가 아직 선택되지 않았습니다. \'ET Tube\' 탭에서 기록해주세요.</p>';
            }
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            calculateAll();
            const attachDateEl = document.getElementById('attachDate');
            if(attachDateEl){
                const now = new Date();
                attachDateEl.value = now.toISOString().substring(0, 10);
                document.getElementById('attachTime').value = now.toTimeString().substring(0, 5);
                calculateRemovalDate();
            }
            document.getElementById('calculate-trachea-btn').addEventListener('click', calculateTracheaSize);
            document.getElementById('trachea-input').addEventListener('keydown', (event) => { if (event.key === 'Enter') calculateTracheaSize(); });
            document.getElementById('saveCatEtTubeSelection').addEventListener('click', saveCatEtTubeSelection);
        });
    </script>
</body>
</html>
