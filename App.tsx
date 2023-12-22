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
import { useState, useEffect, Key } from "react";

type UsuarioData = [{ code: number; idade: number; name: string }];

import * as SQLite from "expo-sqlite";
export default function App() {
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<number | string>("");
  const [idade, setIdade] = useState<number | string>("");
  const [data, setData] = useState<UsuarioData>();
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

  const listar = () => {
    async function listarTodos() {
      try {
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
      } catch (erro) {
        console.log("erro ao tentar listar dados" + erro);
        return false;
      }
    }
    listarTodos();
  };

  const remover = () => {
    async function removerData() {
      try {
        await database.transaction((tx) => {
          tx.executeSql(
            "delete from usuario where code=?",
            [code],
            (_, result) => {
              console.log("usuario deletado", result);
            }
          );
        });
        return true;
      } catch (erro) {
        console.log("erro ao tentar deletar dados" + erro);
        return false;
      }
    }
    removerData();
  };

  const cadastrar = async () => {
    async function InsertData() {
      try {
        await database.transaction((tx) => {
          tx.executeSql(
            "INSERT INTO USUARIO (code,name,idade) VALUES (?,?,?)",
            [code, name, idade],
            (_, result) => {
              console.log("dados inseridos com sucesso", result);
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
        setName("");
        setIdade("");
        setCode("");
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
          <Button title="Procurar" onPress={listar}></Button>
          <Button title="Remover" onPress={remover}></Button>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.code.toString()}
          renderItem={({ item }) => {
            return <Text key={item.code}>{item.name}</Text>;
          }}
        ></FlatList>
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
    marginTop: "20%",
  },
  main: {
    marginTop: "20%",
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
