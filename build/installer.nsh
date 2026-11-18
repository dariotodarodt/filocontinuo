!include nsDialogs.nsh
!include LogicLib.nsh
!include FileFunc.nsh
!ifndef BUILD_UNINSTALLER
  Var FiloDesktopCheckbox
  Var FiloDesktopWanted
  !macro customPageAfterChangeDir
    Page custom FiloShortcutsPage FiloShortcutsLeave
  !macroend
  Function FiloShortcutsPage
    ${GetParameters} $0
    ClearErrors
    ${GetOptions} $0 "--updated" $1
    ${IfNot} ${Errors}
      Abort
    ${EndIf}
    nsDialogs::Create 1018
    Pop $0
    ${NSD_CreateLabel} 0 0 100% 24u "Scegli i collegamenti da creare. Il collegamento nel menu Start viene creato automaticamente."
    Pop $0
    ${NSD_CreateCheckbox} 0 38u 100% 12u "Crea un collegamento FILOCONTINUO sul desktop"
    Pop $FiloDesktopCheckbox
    nsDialogs::Show
  FunctionEnd
  Function FiloShortcutsLeave
    ${NSD_GetState} $FiloDesktopCheckbox $FiloDesktopWanted
  FunctionEnd
  !macro customInstall
    ; Le pagine non vengono eseguite negli aggiornamenti silenziosi.
    ; Conservare la scelta del collegamento senza toccare i dati dei progetti.
    ${If} $FiloDesktopWanted == ""
      ReadRegDWORD $FiloDesktopWanted HKCU "Software\FILOCONTINUO" "DesktopShortcut"
    ${EndIf}
    ${If} $FiloDesktopWanted == ${BST_CHECKED}
      CreateShortCut "$DESKTOP\FILOCONTINUO.lnk" "$INSTDIR\FILOCONTINUO.exe"
      WriteRegDWORD HKCU "Software\FILOCONTINUO" "DesktopShortcut" 1
    ${Else}
      WriteRegDWORD HKCU "Software\FILOCONTINUO" "DesktopShortcut" 0
    ${EndIf}
  !macroend
!endif
!macro customUnInstall
  Delete "$DESKTOP\FILOCONTINUO.lnk"
!macroend
