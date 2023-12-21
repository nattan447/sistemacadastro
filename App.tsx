import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Button,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";

import * as SQLite from "expo-sqlite";
export default function App() {
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<number | string>("");
  const [idade, setIdade] = useState<number | string>("");
  const database = SQLite.openDatabase("sistema.db");
  useEffect(() => {
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

  const cadastrar = async () => {
    async function InsertData() {
      try {
        await database.transaction((tx) => {
          tx.executeSql(
            "INSERT INTO USUARIO (code,name,idade) VALUES (?,?,?)",
            [code, name, idade],
            (_, result) => {
              console.log("dados inseridos com sucesso");
            }
          );
        });
        return true;
      } catch (erro) {
        console.log("erro ao tentar inserir dados" + erro);
        return false;
      }
    }
    if (name != "" && idade != "" && code != "") {
      const sucess = await InsertData();
      if (sucess) {
        console.log("sucesso meu  amigo");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 24 }}>Cadastro de clientes</Text>
      </View>
      <View style={styles.main}>
        <TextInput
          value={name}
          onChangeText={(nome: string) => {
            setName(nome);
          }}
          style={styles.inputs}
          placeholder="digite o nome"
        ></TextInput>
        <TextInput
          value={code as string}
          maxLength={2}
          style={styles.inputs}
          placeholder="digite o código"
          onChangeText={(codigo: string) => {
            setCode(parseInt(codigo));
          }}
          keyboardType="numeric"
        ></TextInput>
        <TextInput
          value={idade as string}
          style={styles.inputs}
          placeholder="digite a idade"
          keyboardType="numeric"
          onChangeText={(Idade: string) => {
            setIdade(parseInt(Idade));
          }}
        ></TextInput>
        <View style={styles.btnview}>
          <Button title="cadastrar" onPress={cadastrar}></Button>
          <Button title="Procurar"></Button>
          <Button title="Remover"></Button>
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
    top: "20%",
  },
  main: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  inputs: {
    paddingLeft: 4,
    margin: "4%",
    backgroundColor: "#F1EBEB",
    width: "50%",
    height: "5%",
    borderRadius: 7,
    borderColor: "black",
    borderWidth: 1,
  },
  btnview: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    marginTop: "4%",
  },
});
