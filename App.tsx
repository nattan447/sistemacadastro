import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Button,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { useState, useEffect, Key, useMemo, useRef } from "react";
import styled from "styled-components/native";

type UsuarioData = [{ code: number; idade: number; name: string }];

import * as SQLite from "expo-sqlite";
export default function App() {
  const ButtonText = styled.Text`
    font-size: 16px;
    color: white;
  `;
  const Buttonn = styled.TouchableHighlight`
    background-color: red;
    width: 100px;
    height: 34px;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    shadow-color: black;
    shadow-offset: 19px 20px;
    shadow-opacity: 0.1;
    margin-top: 20px;
  `;

  const ViewModal = styled.View`
    flex: 1;
    background-color: #f8f8f8;
    align-items: center;
  `;
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [idade, setIdade] = useState<string>("");
  const [data, setData] = useState<UsuarioData>();
  const [dataModal, setDataModal] = useState<UsuarioData>();
  const [showModel, setShowModel] = useState(false);

  const [isloading, setIsloading] = useState(true);
  const database = SQLite.openDatabase("sistema.db");
  useEffect(() => {
    setTimeout(() => {
      setIsloading(false);
    }, 3000);

    async function CreateTable() {
      await database.transaction((tx) => {
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS usuario (code int primary key, name TEXT, idade int);",
          [],
          (_: SQLite.SQLTransaction, result: SQLite.SQLResultSet): boolean => {
            console.log("Tabela criada com sucesso!", result);
            return true;
          },
          (_: SQLite.SQLTransaction, error: SQLite.SQLError): boolean => {
            console.error("Erro ao criar a tabela:", error);
            return false;
          }
        );
      });
    }
    CreateTable();
  }, []);
  const listAll = async () => {
    try {
      await database.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM usuario  ",
          [],
          (_, { rows }: SQLite.SQLResultSet) => {
            console.log(rows._array);
            setDataModal(rows._array as UsuarioData);
            const Code = rows._array.map((obj) => obj.code);
            if (Code[0] === undefined) {
              alert("usuario não encontrado");
            }
          }
        );
      });

      setShowModel(true);
    } catch {
      console.log("erro ao fazer a listagem");
    }
  };
  const listarCode = async () => {
    const listCode = async () =>
      await database.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM usuario where code=?",
          [code],
          (_, { rows }: SQLite.SQLResultSet) => {
            setData(rows._array as UsuarioData);
            const Code = rows._array.map((obj) => obj.code);
            if (Code[0] === undefined) {
              alert("usuario não encontrado");
            }
          }
        );
      });
    if (code != " ") {
      await listCode();
    } else {
      alert("listagem feita por código, preencha esse campo");
    }
  };

  const remover = async () => {
    async function removerData() {
      try {
        await database.transaction((tx) => {
          tx.executeSql(
            "delete from usuario where code=?",
            [code],
            (_, result) => {
              if (result.rowsAffected === 1) {
                alert("usuario  remvido");
              } else {
                alert("usuario não encontrado");
              }
            }
          );
        });
      } catch (erro) {
        console.log("erro ao tentar deletar dados" + erro);
      }
    }
    if (code.length >= 1) {
      await removerData();
    } else {
      alert("remoção feita por código, preencha esse campo");
    }
  };

  const cadastrar = async () => {
    async function InsertData() {
      try {
        await database.transaction((tx) => {
          tx.executeSql(
            "INSERT INTO USUARIO (code,name,idade) VALUES (?,?,?)",
            [code, name, idade],
            (_, result) => {
              alert("dados inseridos com sucesso");
            }
          );
        });
      } catch (erro) {
        console.log("erro ao tentar inserir dados" + erro);
      }
    }

    async function HasData() {
      try {
        await database.transaction((tx) => {
          tx.executeSql(
            "SELECT * FROM usuario where code=?",
            [code],
            async (_, { rows }: SQLite.SQLResultSet) => {
              const Code = rows._array.map((obj) => obj.code);
              if (Code[0] === undefined) {
                await InsertData();
              } else {
                alert("código já cadastrado digite outro");
              }
            }
          );
        });
      } catch {
        alert("erro ao procurar o usuario");
      }
    }

    if (name != "" && idade != "" && code != "") {
      HasData();
      setName("");
      setIdade("");
      setCode("");
    } else {
      alert("preencha todos dados");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={{ fontSize: 30, color: "#607D8B" }}>
            Cadastro de clientes
          </Text>
        </View>

        <View style={styles.inputsview}>
          <TextInput
            value={name}
            onChangeText={(nome: string) => {
              setName(nome);
            }}
            style={styles.inputs}
            placeholder="digite o nome"
          ></TextInput>
          <TextInput
            value={code}
            maxLength={2}
            style={styles.inputs}
            placeholder="digite o código"
            onChangeText={(codigo: string) => {
              setCode(codigo);
            }}
            keyboardType="numeric"
          ></TextInput>
          <TextInput
            value={idade}
            style={styles.inputs}
            placeholder="digite a idade"
            keyboardType="numeric"
            onChangeText={(Idade: string) => {
              setIdade(Idade);
            }}
          ></TextInput>
        </View>
        <View style={styles.btnview}>
          <Buttonn onPress={cadastrar}>
            <ButtonText>cadastrar</ButtonText>
          </Buttonn>
          <Buttonn>
            <ButtonText onPress={listarCode}> procurar</ButtonText>
          </Buttonn>
          <Buttonn onPress={remover}>
            <ButtonText> remover</ButtonText>
          </Buttonn>
        </View>

        <Buttonn onPress={listAll}>
          <ButtonText>listar todos</ButtonText>
        </Buttonn>
        <Modal
          visible={showModel}
          animationType="slide"
          presentationStyle="overFullScreen"
          onRequestClose={() => setShowModel(false)}
        >
          <ViewModal>
            <FlatList
              style={{ width: "100%" }}
              data={dataModal}
              keyExtractor={(item) => item.code.toString()}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      width: "100%",
                      height: 37,
                      marginTop: "10%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      key={item.code}
                      style={{ fontSize: 16, color: "red" }}
                    >
                      {item.name}
                    </Text>
                  </View>
                );
              }}
            ></FlatList>
            <Buttonn onPress={() => setShowModel(false)}>
              <ButtonText>fechar model</ButtonText>
            </Buttonn>
          </ViewModal>
        </Modal>

        <View style={{ width: "100%", alignItems: "center", paddingTop: 50 }}>
          <Text style={{ color: "#607D8B", fontSize: 26, fontWeight: "bold" }}>
            Output
          </Text>
          <FlatList
            style={{ width: "100%" }}
            data={data}
            keyExtractor={(item) => item.code.toString()}
            renderItem={({ item }) => {
              console.log("itens da flatlist" + item);
              return (
                <View
                  style={{
                    width: "100%",
                    height: 37,
                    marginTop: "10%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text key={item.code} style={{ fontSize: 16, color: "red" }}>
                    {item.name}
                  </Text>
                </View>
              );
            }}
          ></FlatList>
        </View>
      </View>

      <StatusBar style="auto" hidden={true} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    marginTop: "30%",
    bottom: "7%",
  },
  main: {
    height: "100%",
    width: "100%",
    alignItems: "center",
  },

  inputs: {
    borderStartColor: "gray",
    paddingLeft: 4,
    margin: "4%",
    backgroundColor: "#F1EBEB",
    width: "50%",
    height: 40,
    borderRadius: 7,
    borderColor: "black",
    borderWidth: 1,
  },
  inputsview: {
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    marginTop: "20%",
  },

  btnview: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    marginTop: "4%",
  },
});
