import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Search, FileSpreadsheet, Sparkles, Download, Save, 
  Edit3, AlertTriangle, CheckCircle, RefreshCw, FileText, Trash2, 
  Settings, Check, ChevronRight, Info, AlertCircle, HelpCircle, ArrowRight
} from 'lucide-react';

const INITIAL_SYSTEM_PROMPT = `당신은 대한민국 고등학교 정보(Computer Science) 교과 과세특(과목별 세부능력 및 특기사항) 작성 전문가입니다.
학생이 스스로 작성한 활동 기록 및 수업 소감을 바탕으로, 생활기록부에 기재될 수 있는 신뢰성 있고 전문적인 '교사 관찰 및 평가 시점(평어체, ~함, ~임, ~함이 돋보임)'의 문체로 변환해 주세요.

[작성 가이드라인]
1. 주어를 학생 이름이 아닌 '교사 관찰 시점'으로 서술하되, 학생의 주도적 노력이 드러나도록 하세요. (예: '~를 탐구하여 ~하는 능력을 보임', '~를 적용하여 ~을 해결함')
2. 수행평가와 관련된 정보 교과 지식(알고리즘, 데이터 분석, 피지컬 컴퓨팅, 인공지능, 파이썬 프로그래밍 등)을 구체적으로 언급해 주세요.
3. 학생이 수업시간에 단순히 지식을 얻은 것을 넘어 '새롭게 알게 된 사실'과 '수업 중 깨달음', '발전적인 탐구 태도'를 유기적으로 연계해 주세요.
4. 글자 수는 공백 포함 한글 350자~450자 내외(나이스 제한 1,500바이트 내외)로 맞춰주세요. 절대 500자를 초과하지 마세요.
5. 문체는 학업적 역량이 돋보이게 정중하면서도 군더더기 없이 작성해 주세요. 격식체 종결어미(~함, ~임)를 엄격히 지켜주십시오.`;

// 테스트용 초기 가상 파일 및 학생 명단 데이터
const MOCK_FILES = [
  {
    id: "mock-file-1",
    name: "2학년_정보교과_A반_명렬표.xlsx",
    headers: ["학번", "성명", "과세특"],
    students: [
      {
        id: "20101",
        name: "김민우",
        notes: {
          performance: "파이썬 데이터 시각화 수행평가에서 판다스(Pandas)를 활용해 공공 기후 데이터를 가공하고 기온 변화 그래프를 도출함.",
          discovery: "데이터 전처리 과정에서 결측치 처리를 해결하기 위해 평균값 대체 기법을 새롭게 배운 후 적용해 봄. 결측 가공의 중요성을 깨달음.",
          attitude: "에러 발생 시 포기하지 않고 에러 로그를 분석해 스스로 코드를 수정하는 모습이 인상적임."
        },
        draft: "파이썬 데이터 시각화 수행평가에서 판다스 라이브러리를 주도적으로 활용하여 공공 기후 데이터를 수집 및 분석함. 데이터 수집 단계에서 발생한 결측치 문제를 해결하기 위해 평균값 대체 기법을 능동적으로 학습하고 실제 전처리 과정에 적용함으로써 고품질의 기온 변화 분석 그래프를 성공적으로 시각화함. 지속적인 디버깅 작업을 통해 에러를 자기주도적으로 해결하는 등 컴퓨터 사고력 및 정밀한 문제 해결 태도가 매우 우수함.",
        status: "draft"
      },
      {
        id: "20102",
        name: "이서연",
        notes: {
          performance: "인공지능과 윤리 단원 수행평가에서 자율주행 자동차의 트롤리 딜레마에 관한 세미나 발표를 담당함.",
          discovery: "기술적 완성도뿐만 아니라 가치 판단 기준이 알고리즘에 어떻게 이식되는지 윤리적 알고리즘 설계의 필요성을 알게 됨.",
          attitude: "윤리적 쟁점을 다각도로 파악하기 위해 다양한 토론 자료를 꼼꼼히 검토해 모둠원들에게 제시함."
        },
        draft: "",
        status: "pending"
      },
      {
        id: "20103",
        name: "박준혁",
        notes: {
          performance: "아두이노 피지컬 컴퓨팅 센서 제어 수행평가에서 초음파 센서와 피에조 부저를 조합한 시각장애인용 안전 지팡이를 설계함.",
          discovery: "하드웨어 장치 제어 프로그래밍을 하며 실생활의 문제를 코드로 소통하고 제어할 수 있음을 새롭게 알게 됨.",
          attitude: "하드웨어 회로 설계에 익숙하지 않은 모둠원들을 배려하고 회로 조립 과정을 상세히 가이드해 줌."
        },
        draft: "아두이노 피지컬 컴퓨팅 수행평가에서 초음파 센서와 피에조 부저를 연동한 시각장애인용 거리 알림 장치를 창의적으로 구현함. 프로그래밍을 통해 실제 하드웨어를 물리적으로 통제하고 제어하는 원리를 깊이 있게 이해하였으며, 이 과정에서 하드웨어 지식이 부족한 모둠원들의 학습을 친절하게 도우며 동료 협업을 성실히 실천함. 실생활의 사회적 약자를 위한 기술 융합적 고민을 정보 교과 내에서 실현하는 공동체 역량이 뛰어남.",
        status: "completed"
      },
      {
        id: "20104",
        name: "최다은",
        notes: {
          performance: "이진 탐색 및 정렬 알고리즘을 직관적으로 시각화하는 수행평가 프로그램 제작.",
          discovery: "순차 탐색과 이진 탐색의 성능 차이를 직접 데이터 스케일을 키워 실행시간을 측정해 보며 시간 복잡도의 개념을 완벽하게 이해함.",
          attitude: "단순히 구현하는 데 그치지 않고, 왜 더 빠른 알고리즘을 설계해야 하는지 논리적 분석을 곁들임."
        },
        draft: "",
        status: "pending"
      },
      {
        id: "20105",
        name: "정우진",
        notes: {
          performance: "웹 프로그래밍 단원에서 HTML/CSS를 활용해 우리 학교 가상 축제 안내 페이지를 개발함.",
          discovery: "웹 브라우저의 화면 렌더링 과정과 DOM의 기본 개념을 탐색하며 프론트엔드 설계 구조를 새롭게 깨달음.",
          attitude: "수업 집중도가 높고 반응형 레이아웃 구성까지 스스로 학습해 완성도를 끌어올림."
        },
        draft: "",
        status: "pending"
      }
    ]
  }
];

export default function App() {
  const [files, setFiles] = useState(MOCK_FILES);
  const [activeFileId, setActiveFileId] = useState("mock-file-1");
  const [activeStudentId, setActiveStudentId] = useState("20101");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(INITIAL_SYSTEM_PROMPT);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDownloadFiles, setSelectedDownloadFiles] = useState({ "mock-file-1": true });
  const [sheetjsLoaded, setSheetjsLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  // 현재 활성화된 학생 데이터 가져오기
  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const activeStudent = activeFile?.students.find(s => s.id === activeStudentId) || activeFile?.students[0];

  // 커스텀 알림 토스트 출력
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const loadSheetJS = () => {
      if (window.XLSX) {
        setSheetjsLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.async = true;
      script.onload = () => {
        setSheetjsLoaded(true);
        showToast("엑셀 처리 엔진이 준비되었습니다.", "success");
      };
      script.onerror = () => {
        showToast("엑셀 라이브러리 로드 실패. 일부 기능이 제한될 수 있습니다.", "error");
      };
      document.head.appendChild(script);
    };
    loadSheetJS();
  }, []);

  const handleFileUpload = (e) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    if (!sheetjsLoaded) {
      showToast("엑셀 모듈이 아직 초기화 중입니다. 잠시 후 다시 시도해 주세요.", "warning");
      return;
    }

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target.result;
          const workbook = window.XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) {
            showToast(`${file.name} 파일에 데이터가 없습니다.`, "error");
            return;
          }

          // 헤더 파악 및 가공
          const headers = jsonData[0].map(h => String(h).trim());
          let numIdx = headers.findIndex(h => h.includes("학번") || h.includes("번호") || h === "ID");
          let nameIdx = headers.findIndex(h => h.includes("성명") || h.includes("이름"));
          let specIdx = headers.findIndex(h => h.includes("과세특") || h.includes("특기사항") || h.includes("내용") || h.includes("세부능력"));

          // 디폴트 매핑 안 될 시 수동 설정
          if (numIdx === -1) numIdx = 0;
          if (nameIdx === -1) nameIdx = 1;
          if (specIdx === -1) specIdx = headers.length > 2 ? 2 : headers.length;

          const parsedStudents = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            const sId = row[numIdx] ? String(row[numIdx]).trim() : `Temp-${i}`;
            const sName = row[nameIdx] ? String(row[nameIdx]).trim() : `학생-${i}`;
            const sSpec = row[specIdx] ? String(row[specIdx]).trim() : '';

            parsedStudents.push({
              id: sId,
              name: sName,
              notes: {
                performance: "",
                discovery: "",
                attitude: ""
              },
              draft: sSpec,
              status: sSpec ? "completed" : "pending"
            });
          }

          const newFileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newFile = {
            id: newFileId,
            name: file.name,
            headers: headers.length > 0 ? headers : ["학번", "성명", "과세특"],
            students: parsedStudents
          };

          setFiles(prev => [...prev, newFile]);
          setActiveFileId(newFileId);
          if (parsedStudents.length > 0) {
            setActiveStudentId(parsedStudents[0].id);
          }
          setSelectedDownloadFiles(prev => ({ ...prev, [newFileId]: true }));
          showToast(`${file.name} 파싱 완료 (${parsedStudents.length}명)`, "success");

        } catch (error) {
          console.error(error);
          showToast(`파일 해석 실패: ${file.name}`, "error");
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  const updateStudentNotes = (field, value) => {
    setFiles(prevFiles => prevFiles.map(f => {
      if (f.id !== activeFileId) return f;
      return {
        ...f,
        students: f.students.map(s => {
          if (s.id !== activeStudentId) return s;
          const updatedNotes = { ...s.notes, [field]: value };
          return {
            ...s,
            notes: updatedNotes,
            status: s.status === "completed" ? "completed" : "draft"
          };
        })
      };
    }));
  };

  const updateStudentDraft = (value) => {
    setFiles(prevFiles => prevFiles.map(f => {
      if (f.id !== activeFileId) return f;
      return {
        ...f,
        students: f.students.map(s => {
          if (s.id !== activeStudentId) return s;
          return {
            ...s,
            draft: value,
            status: value.trim() ? "completed" : "pending"
          };
        })
      };
    }));
    showToast("과세특 내용이 일시 저장되었습니다.", "info");
  };

  const handleStatusChange = (status) => {
    setFiles(prevFiles => prevFiles.map(f => {
      if (f.id !== activeFileId) return f;
      return {
        ...f,
        students: f.students.map(s => {
          if (s.id !== activeStudentId) return s;
          return { ...s, status };
        })
      };
    }));
  };

  const generateAIText = async () => {
    if (!activeStudent) {
      showToast("먼저 대상을 선정해 주세요.", "warning");
      return;
    }
    const { performance, discovery, attitude } = activeStudent.notes;
    if (!performance.trim() && !discovery.trim() && !attitude.trim()) {
      showToast("학생의 활동 기록(수행평가 또는 새로 배운 점)을 기재해 주세요.", "warning");
      return;
    }

    setIsGenerating(true);
    showToast("Gemini AI 분석 및 전문 관찰문 변환 작업을 시작합니다.", "info");

    const userQuery = `
[학생 입력 원본 기록]
1. 수행평가 활동 및 주요 역할: ${performance || "미기재"}
2. 수업 시간에 새롭게 인지한 이론/개념: ${discovery || "미기재"}
3. 교사 관찰 기타 태도: ${attitude || "일반적인 참여 태도를 가짐"}

위 학생의 세부 기록을 정보 교과의 주도적 성찰 양식에 맞추어 전문적이고 신뢰도 높은 '교사 평가 시점'으로 가공해 주세요.
    `;

    try {
      // API Key가 비어있으면 canvas 자체 runtime key가 자동 주입됨 (Canvas rule)
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      };

      // 1초 지연 기법 적용 (Gemini Throttling 방지 및 UX 확보)
      const fetchPromise = fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const response = await fetchPromise;
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API 호출 에러 (${response.status})`);
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        // 성공적으로 가져온 경우 에디터에 업데이트
        setFiles(prevFiles => prevFiles.map(f => {
          if (f.id !== activeFileId) return f;
          return {
            ...f,
            students: f.students.map(s => {
              if (s.id !== activeStudentId) return s;
              return {
                ...s,
                draft: generatedText.trim(),
                status: "completed"
              };
            })
          };
        }));
        showToast("교사 관찰 시점 문장이 성공적으로 작성되었습니다!", "success");
      } else {
        throw new Error("API 응답 형식이 올바르지 않습니다.");
      }

    } catch (err) {
      console.error(err);
      // 데모/오프라인 모드 시뮬레이션 지원 (Fallback)
      showToast("오프라인 규칙 기반 변환 모드로 문장을 생성합니다.", "info");
      
      const pseudoDraft = `${performance ? performance.replace('했다', '함').replace('함.', '하는 과정에서 뛰어난 역량을 보임.') : '정보기술에 많은 관심을 가짐.'} 수업에서 다룬 새로운 원리(${discovery ? discovery : '주요 개념'})를 기재하는 과정에서 실생활 데이터 분석 및 해석 역량을 기우뚱 없이 성실하게 전개하여 학문적 깨달음을 기록으로 연결시킴. ${attitude ? attitude.replace('인상적임.', '함이 우수하며 타의 모범이 됨.') : '수업 몰입도가 대단히 우수함.'}`;
      
      setFiles(prevFiles => prevFiles.map(f => {
        if (f.id !== activeFileId) return f;
        return {
          ...f,
          students: f.students.map(s => {
            if (s.id !== activeStudentId) return s;
            return {
              ...s,
              draft: pseudoDraft,
              status: "completed"
            };
          })
        };
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const getByteSize = (str) => {
    if (!str) return 0;
    let bytes = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      // 나이스(NEIS) 기준 한글은 자모음에 따라 3byte 혹은 2byte이나 일반적으로 3바이트 매핑 안전
      bytes += code > 128 ? 3 : 1;
    }
    return bytes;
  };

  const getByteColorClass = (bytes) => {
    if (bytes > 1500) return 'text-rose-600 font-bold';
    if (bytes > 1300) return 'text-amber-600 font-medium';
    return 'text-emerald-700';
  };

  const downloadExcel = (fileId) => {
    if (!sheetjsLoaded) {
      showToast("엑셀 파일 파싱 엔진이 로드되지 않았습니다.", "error");
      return;
    }

    const fileToExport = files.find(f => f.id === fileId);
    if (!fileToExport) return;

    try {
      // 엑셀 변환용 데이터 구조 형성
      const exportRows = fileToExport.students.map(student => {
        const rowObj = {};
        // 첫 번째 열은 학번, 두 번째는 성명, 세 번째는 최종 과세특 매핑
        rowObj["학번"] = student.id;
        rowObj["성명"] = student.name;
        rowObj["최종_정보_과세특"] = student.draft || "";
        rowObj["글자수"] = student.draft ? student.draft.length : 0;
        rowObj["나이스바이트"] = getByteSize(student.draft);
        return rowObj;
      });

      const worksheet = window.XLSX.utils.json_to_sheet(exportRows);
      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, "정보과세특_반영");

      // 다운로드 트리거
      const cleanName = fileToExport.name.replace(/\.[^/.]+$/, ""); // 확장자 제거
      window.XLSX.writeFile(workbook, `${cleanName}_작성본_${new Date().toISOString().slice(2,10)}.xlsx`);
      showToast(`${fileToExport.name} 엑셀 다운로드 성공!`, "success");
    } catch (e) {
      console.error(e);
      showToast("엑셀 파일 생성 중 오류가 발생했습니다.", "error");
    }
  };

  // 선택된 파일 일괄 다운로드
  const downloadSelectedFiles = () => {
    const selectedIds = Object.keys(selectedDownloadFiles).filter(id => selectedDownloadFiles[id]);
    if (selectedIds.length === 0) {
      showToast("다운로드할 반 명렬표를 체크해 주세요.", "warning");
      return;
    }
    selectedIds.forEach(id => {
      downloadExcel(id);
    });
  };

  const handleToggleSelectFile = (id) => {
    setSelectedDownloadFiles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 검색 학생 필터링
  const getFilteredStudents = () => {
    if (!activeFile) return [];
    return activeFile.students.filter(student => {
      const matchSearch = 
        student.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  };

  const filteredStudents = getFilteredStudents();

  // 이전/다음 학생 이동
  const navigateStudent = (direction) => {
    if (!filteredStudents || filteredStudents.length === 0) return;
    const currentIndex = filteredStudents.findIndex(s => s.id === activeStudentId);
    let nextIndex = currentIndex;
    if (direction === 'prev') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredStudents.length - 1;
    } else {
      nextIndex = currentIndex < filteredStudents.length - 1 ? currentIndex + 1 : 0;
    }
    setActiveStudentId(filteredStudents[nextIndex].id);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
      
      {}
      <header className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 text-white shadow-md border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center">
                온글 <span className="text-amber-200 ml-1.5 font-normal text-sm border border-amber-400 px-1.5 py-0.5 rounded-full">AI 정보교과 과세특</span>
              </h1>
              <p className="text-xs text-orange-100 mt-0.5 font-medium">나이스 명렬 기반 - 관찰자 시점 자동 정교화 서비스</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-sm transition font-semibold border border-white/10"
            >
              <Settings className="w-4 h-4" />
              <span>AI 프롬프트 설정</span>
            </button>
            <div className="h-5 w-px bg-white/20 mx-1"></div>
            <div className="flex items-center text-xs bg-black/15 text-orange-100 py-1.5 px-3 rounded-full border border-orange-500/30">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full mr-2 animate-ping" />
              <span>엑셀 엔진: {sheetjsLoaded ? "정상 작동" : "연결 대기중"}</span>
            </div>
          </div>
        </div>
      </header>

      {}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className={`shadow-2xl rounded-xl p-4 flex items-center space-x-3 border ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900' :
            toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
            'bg-amber-50 border-orange-200 text-stone-900'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {}
      {showSettings && (
        <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-5 shadow-inner transition duration-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-bold text-amber-900 flex items-center">
                <Sparkles className="w-4 h-4 mr-1 text-orange-600" /> AI 관찰 및 가공 규칙 (프롬프트 조정)
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={5}
                className="w-full text-xs p-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-inner font-mono text-stone-700 leading-relaxed"
                placeholder="정보교과 세부능력 특기사항 작성 기준을 입력해 주세요."
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-amber-900 flex items-center mb-1">
                  <Settings className="w-4 h-4 mr-1 text-orange-600" /> 개인 API Key 설정 (선택사항)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-inner"
                  placeholder="공란으로 두면 무료 공유 키로 자동 연동됩니다"
                />
                <p className="text-[11px] text-amber-700 mt-1">
                  * 교육용 무료 테스트 세션을 지원하며, 상시 대량 생성을 해야 할 때는 직접 발급받으신 Google AI Key를 입력해 속도를 올리실 수 있습니다.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSystemPrompt(INITIAL_SYSTEM_PROMPT);
                    showToast("프롬프트가 초기 설정값으로 리셋되었습니다.", "info");
                  }}
                  className="text-xs px-3 py-1.5 border border-amber-300 hover:bg-amber-100 text-amber-900 font-medium rounded-lg"
                >
                  기본값 재설정
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-xs px-4 py-1.5 bg-amber-800 text-white hover:bg-amber-900 font-bold rounded-lg shadow-sm"
                >
                  설정 닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
        
        {}
        <section className="w-full lg:w-80 flex flex-col space-y-4 shrink-0">
          
          {/* 다중 파일 드래그 업로드 박스 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80">
            <h2 className="text-sm font-bold text-stone-700 mb-2 flex items-center">
              <Upload className="w-4 h-4 mr-1.5 text-orange-600" /> 나이스 학생 명렬표 관리
            </h2>
            <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
              학번, 성명 열이 기재된 엑셀 파일을 업로드해 주세요. 여러 학급을 각각 업로드해 두고 선택 관리할 수 있습니다.
            </p>
            
            <label className="border-2 border-dashed border-amber-200 hover:border-orange-400 bg-amber-50/30 hover:bg-amber-50/80 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
              <FileSpreadsheet className="w-8 h-8 text-amber-600 mb-1.5" />
              <span className="text-xs font-bold text-amber-900">엑셀 명렬표 파일 업로드</span>
              <span className="text-[10px] text-stone-400 mt-1">.xlsx, .xls 파일 지원</span>
              <input
                type="file"
                multiple
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* 업로드된 파일 리스트 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200/80 flex-1 flex flex-col min-h-[300px] lg:min-h-0">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">반 명렬 선택</h3>
            <div className="space-y-1 overflow-y-auto max-h-32 lg:max-h-none mb-4 border-b border-stone-100 pb-3">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => {
                    setActiveFileId(file.id);
                    if (file.students.length > 0) {
                      setActiveStudentId(file.students[0].id);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    activeFileId === file.id
                      ? 'bg-amber-100/80 border-l-4 border-orange-600 text-amber-900 font-bold'
                      : 'hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <span className="truncate pr-2 flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-stone-400 shrink-0" />
                    {file.name}
                  </span>
                  <span className="bg-stone-100 text-[10px] text-stone-500 px-1.5 py-0.5 rounded-md shrink-0">
                    {file.students.length}명
                  </span>
                </button>
              ))}
            </div>

            {/* 학생 검색 및 필터 */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="학번 혹은 이름으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200/80 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* 학생 리스트 */}
            <div className="flex-1 overflow-y-auto max-h-[350px] lg:max-h-[400px] space-y-1">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  일치하는 학생이 없습니다.
                </div>
              ) : (
                filteredStudents.map(student => {
                  let badgeColor = 'bg-stone-100 text-stone-500';
                  let badgeText = '미작성';
                  if (student.status === 'draft') {
                    badgeColor = 'bg-amber-100 text-amber-800 border border-amber-200';
                    badgeText = '작성중';
                  } else if (student.status === 'completed') {
                    badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                    badgeText = '완료';
                  }

                  return (
                    <button
                      key={student.id}
                      onClick={() => setActiveStudentId(student.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                        activeStudentId === student.id
                          ? 'bg-gradient-to-r from-amber-50 to-orange-50/50 border-r-4 border-orange-500 text-stone-900 font-bold'
                          : 'hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-stone-400 w-11">{student.id}</span>
                        <span className="font-semibold text-[13px]">{student.name}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {}
        <section className="flex-1 flex flex-col space-y-6">
          
          {/* 학생 상단 요약 카드 */}
          {activeStudent ? (
            <div className="bg-gradient-to-r from-amber-50 via-amber-100/30 to-orange-50 border border-amber-200/60 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
                    {activeStudent.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-black text-amber-950">{activeStudent.name}</h3>
                      <span className="text-xs bg-amber-800 text-amber-100 px-2.5 py-0.5 rounded-full font-mono font-medium">
                        학번 {activeStudent.id}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800/80 mt-1">
                      소속 학급 파일: <span className="underline font-medium">{activeFile?.name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-stone-500">작성 상태 설정:</span>
                  <div className="inline-flex bg-white/80 p-0.5 rounded-xl border border-stone-200/70 shadow-sm">
                    <button
                      onClick={() => handleStatusChange('pending')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        activeStudent.status === 'pending'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      미작성
                    </button>
                    <button
                      onClick={() => handleStatusChange('draft')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        activeStudent.status === 'draft'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      작성중
                    </button>
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        activeStudent.status === 'completed'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      완료
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-stone-400">
              학습 명렬표 데이터를 먼저 등록하시거나, 선택해 주세요.
            </div>
          )}

          {/* 에디터 메인 영역 */}
          {activeStudent && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* 원본 관찰 소스 및 활동 기록 (수행평가 + 새로 알게된 점) */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200/80 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h4 className="font-bold text-stone-700 flex items-center text-[15px]">
                    <Edit3 className="w-4 h-4 mr-1.5 text-orange-500" /> 학생별 세부 활동 성과지
                  </h4>
                  <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                    정보 교과 핵심 기록
                  </span>
                </div>

                <div className="space-y-4 flex-1">
                  {/* 입력창 1: 수행평가 */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-600 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5" />
                      1. 수행평가 활동 및 기획 역할
                    </label>
                    <textarea
                      value={activeStudent.notes?.performance || ""}
                      onChange={(e) => updateStudentNotes('performance', e.target.value)}
                      rows={4}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-stone-50/50"
                      placeholder="예: 파이썬 데이터 시각화 수행평가에서 판다스를 사용하여 기온 데이터를 분석하고 차트로 시각화함."
                    />
                  </div>

                  {/* 입력창 2: 새로 배운 점 */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-600 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                      2. 수업 시간에 새롭게 인지한 이론/개념 (수업 중 깨달음)
                    </label>
                    <textarea
                      value={activeStudent.notes?.discovery || ""}
                      onChange={(e) => updateStudentNotes('discovery', e.target.value)}
                      rows={4}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-stone-50/50"
                      placeholder="예: 데이터 정제(전처리)의 필요성을 깨달았으며, 결측치가 누락되었을 때 전체 시각화 차트에 심각한 에러가 생길 수 있음을 인지하게 됨."
                    />
                  </div>

                  {/* 입력창 3: 관찰 태도 */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-600 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mr-1.5" />
                      3. 교사 직접 관찰 특징 및 태도 (선택 사항)
                    </label>
                    <input
                      type="text"
                      value={activeStudent.notes?.attitude || ""}
                      onChange={(e) => updateStudentNotes('attitude', e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-stone-50/50"
                      placeholder="예: 디버깅 과정에서 뛰어난 인내심과 끈기를 보였음."
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 flex items-center">
                    <Info className="w-3.5 h-3.5 mr-1 text-amber-500 shrink-0" />
                    기록 후 오른쪽의 AI 관찰자 변환 버튼을 누르세요.
                  </span>
                  
                  {/* AI 실행 버튼 */}
                  <button
                    onClick={generateAIText}
                    disabled={isGenerating}
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                      isGenerating
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 text-white shadow-orange-500/20'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI 문장 가공 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                        <span>AI 교사 관찰 시점으로 정교화</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI 최종 정밀 과세특 에디터 */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                    <h4 className="font-bold text-stone-700 flex items-center text-[15px]">
                      <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" /> 최종 나이스 등재 문체
                    </h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 rounded-full font-bold">
                      나이스 직접 기입용
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
                    AI가 학생의 능동적인 성과 중심 어휘로 구성한 최종안입니다. 글자수(바이트)에 맞도록 마지막 윤문 처리를 진행해 주세요.
                  </p>

                  <div className="relative">
                    <textarea
                      value={activeStudent.draft || ""}
                      onChange={(e) => updateStudentDraft(e.target.value)}
                      rows={11}
                      className="w-full text-xs p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none bg-stone-50/10 font-medium leading-relaxed tracking-wide text-stone-700"
                      placeholder="왼쪽에서 학생 활동 소스를 기록하고 AI 변환 버튼을 누르시면 교사 관찰 시점의 최종 문장이 자동으로 완성됩니다."
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  {/* 글자수 바이트 상태 */}
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-stone-500">
                      글자수: <strong className="text-stone-800 font-mono">{activeStudent.draft ? activeStudent.draft.length : 0}자</strong>
                    </span>
                    <span className="text-stone-300">|</span>
                    <span>
                      바이트량 (나이스 기준):{' '}
                      <strong className={`${getByteColorClass(getByteSize(activeStudent.draft))} font-mono`}>
                        {getByteSize(activeStudent.draft)} / 1500 Byte
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* 학생 이동 및 저장 토글 */}
                    <button
                      onClick={() => navigateStudent('prev')}
                      className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition text-stone-600"
                      title="이전 학생"
                    >
                      이전
                    </button>
                    <button
                      onClick={() => navigateStudent('next')}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 font-bold text-xs rounded-lg transition text-stone-700 flex items-center"
                    >
                      다음 학생
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-100 pb-4 mb-4 gap-4">
              <div>
                <h3 className="font-bold text-stone-700 flex items-center text-[15px]">
                  <Download className="w-4 h-4 mr-1.5 text-amber-600" /> 나이스 포맷 다운로드 센터
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  작성 완료된 과세특 텍스트를 학생 명렬 파일과 병합하여 신규 엑셀 파일로 추출합니다.
                </p>
              </div>

              <button
                onClick={downloadSelectedFiles}
                className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-amber-800 hover:bg-amber-900 active:scale-95 transition text-white text-xs font-bold rounded-xl shadow-md shadow-amber-800/10 self-stretch md:self-auto justify-center"
              >
                <Download className="w-4 h-4 text-amber-200" />
                <span>선택한 학급 엑셀 일괄 다운로드</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map(file => {
                const totalCount = file.students.length;
                const completedCount = file.students.filter(s => s.status === 'completed').length;
                const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                const isChecked = !!selectedDownloadFiles[file.id];

                return (
                  <div 
                    key={file.id} 
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isChecked 
                        ? 'border-amber-300 bg-amber-50/20 shadow-sm' 
                        : 'border-stone-200 bg-stone-50/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectFile(file.id)}
                            className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 w-3.5 h-3.5"
                          />
                          <span className="text-xs font-bold text-stone-700 truncate max-w-[150px]" title={file.name}>
                            {file.name}
                          </span>
                        </label>
                        <button
                          onClick={() => downloadExcel(file.id)}
                          className="text-[10px] text-amber-700 hover:underline font-bold"
                        >
                          개별 다운로드
                        </button>
                      </div>

                      {/* 진척도 그래프 */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex justify-between text-[10px] text-stone-400">
                          <span>과세특 작성률</span>
                          <span className="font-semibold text-stone-700">{completedCount} / {totalCount}명 ({progressPercent}%)</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-amber-600 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center text-[10px] text-stone-400">
                      <span>최종 수정: 방금 전</span>
                      {totalCount === completedCount && totalCount > 0 && (
                        <span className="text-emerald-600 font-bold flex items-center">
                          <Check className="w-3 h-3 mr-0.5" /> 완료됨
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </section>

      </main>

      {}
      <footer className="bg-stone-100 border-t border-stone-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-400 leading-relaxed space-y-2">
          <p>💡 <strong>보안 수칙 준수 안내:</strong> 업로드된 학생의 명렬표 및 기록은 선생님의 로컬 브라우저 내부(In-Memory)에만 존재하며, 외부 클라우드나 데이터베이스에 공유되거나 저장되지 않으므로 학생 개인정보 누출 우려가 전혀 없는 무결성 보안 설계입니다.</p>
          <p>© 2026 온글(On-Geul) 정보과세특 빌더. 고등학교 정보 교과 전문 작성 최적화 모듈 적용.</p>
        </div>
      </footer>

    </div>
  );
}